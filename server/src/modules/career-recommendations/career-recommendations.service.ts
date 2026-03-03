import { Injectable } from '@nestjs/common';
import { InterestType as PrismaInterestType } from '@prisma/client';
import type { CareerScenarioType } from '../../config/career-scenarios.constants';
import prisma from '../../config/prisma';
import {
  SKILL_SUFFICIENT_LEVEL,
  MAX_DEPTH,
  TOP_N,
  BEAM_SIZE,
  MAX_PATHS_GLOBAL,
  MAX_TARGETS,
  MAX_CANDIDATES_PER_TARGET,
  MAX_UNIQUE_TARGETS_IN_TOP,
  W_BEAM_LENGTH,
  W_BEAM_EDGE_READINESS,
  HISTORY_BIAS_CAP,
  BASE_STEP_COST,
  TIME_COST_ALPHA,
  TIME_NORM_WHEN_EQUAL,
  INTEREST_FIT_NEUTRAL,
  DEPARTMENT_TO_INTEREST,
  HISTORY_RECENT_DAYS,
  HISTORY_OLD_DAYS,
} from '../../config/recommendations.constants';
import {
  SCENARIO_WEIGHTS,
  BONUS_VERTICAL_PER_EDGE,
  PENALTY_CHANGE_PER_EDGE,
  MANAGER_BONUS_IF_TARGET_MGMT,
  MANAGER_BONUS_IF_EDGE_TO_MGMT,
  isManagementTarget,
  SCENARIO_MAX_DEPTH_OFFSET,
} from '../../config/career-scenarios.constants';
import type {
  CareerRecommendationsResponseDto,
  RecommendationItemDto,
  PathScoresDto,
  SkillDeficitDto,
} from './dto/recommendations-response.dto';
import type { SkillInfo } from '../../common/types/skill.types';

interface TransitionEdge {
  id: string;
  fromPositionId: string;
  toPositionId: string;
  type: string;
  requiredSkills: SkillInfo[];
}

interface PositionInfo {
  id: string;
  title: string;
  level: number;
  department: string;
}

interface GraphData {
  byFrom: Map<string, TransitionEdge[]>;
  positions: Map<string, PositionInfo>;
  transitions: TransitionEdge[];
}

interface PathStep {
  transition: TransitionEdge;
  toPositionId: string;
}

interface UnionSkillMeta {
  requiredLevel: number;
  name: string;
  category: string | null;
  deficit: number;
}

interface ScoredPath {
  path: PathStep[];
  targetPositionId: string;
  reachabilityAvg: number;
  reachabilityMin: number;
  difficulty: number;
  timeCost: number;
  interestFit: number;
  historyBias: number;
  scenarioBonus: number;
  overall: number;
  timeNorm: number;
  unionSkills: Map<string, UnionSkillMeta>;
}

@Injectable()
export class CareerRecommendationService {
  private graphCache: GraphData | null = null;

  private async getGraph(): Promise<GraphData> {
    if (this.graphCache) return this.graphCache;
    const [transitions, positions] = await Promise.all([
      prisma.transition.findMany({
        include: { requiredSkills: true },
      }),
      prisma.position.findMany({
        select: { id: true, title: true, level: true, department: true },
      }),
    ]);
    const byFrom = new Map<string, TransitionEdge[]>();
    const positionMap = new Map<string, PositionInfo>();
    for (const p of positions) {
      positionMap.set(p.id, p);
    }
    const edges: TransitionEdge[] = transitions.map((t) => ({
      id: t.id,
      fromPositionId: t.fromPositionId,
      toPositionId: t.toPositionId,
      type: t.type,
      requiredSkills: t.requiredSkills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
      })),
    }));
    for (const e of edges) {
      const list = byFrom.get(e.fromPositionId) ?? [];
      list.push(e);
      byFrom.set(e.fromPositionId, list);
    }
    this.graphCache = { byFrom, positions: positionMap, transitions: edges };
    return this.graphCache;
  }

  async getRecommendations(
    userId: string,
    options: {
      limit?: number;
      maxDepth?: number;
      targetPositionId?: string;
      scenario?: CareerScenarioType;
    },
  ): Promise<CareerRecommendationsResponseDto> {
    const limit = Math.min(options.limit ?? TOP_N, 20);
    const baseMaxDepth = options.maxDepth ?? MAX_DEPTH;
    const targetPositionId = options.targetPositionId;

    const [user, userSkillsData, historyRows] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          positionId: true,
          currentPositionId: true,
          interests: true,
          activeScenario: true,
        },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        select: { skillId: true, level: true },
      }),
      prisma.userTransitionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          fromPositionId: true,
          toPositionId: true,
          createdAt: true,
          transitionType: true,
        },
      }),
    ]);

    // positionId = source of truth (official current role); currentPositionId = fallback only when positionId is null
    const startPositionId = user?.positionId ?? user?.currentPositionId ?? null;
    if (!startPositionId) {
      return {
        startPositionId: null,
        reason: 'noStartPosition',
        recommendations: [],
      };
    }

    const scenario: CareerScenarioType =
      options.scenario ?? user?.activeScenario ?? 'FAST_GROWTH';
    const depthOffset = SCENARIO_MAX_DEPTH_OFFSET[scenario] ?? 0;
    const maxDepth = Math.min(baseMaxDepth + depthOffset, 10);

    const skillMap = new Map<string, number>(
      userSkillsData.map((u) => [u.skillId, u.level]),
    );
    const interests = user?.interests ?? [];
    const graph = await this.getGraph();

    if (graph.transitions.length === 0 || graph.positions.size === 0) {
      return {
        startPositionId,
        reason: 'noGraphData',
        recommendations: [],
      };
    }
    if (!graph.positions.has(startPositionId)) {
      return {
        startPositionId,
        reason: 'noGraphData',
        recommendations: [],
      };
    }
    if (!graph.byFrom.get(startPositionId)?.length) {
      return {
        startPositionId,
        reason: 'noPaths',
        recommendations: [],
      };
    }

    let targetIds: string[] = [];
    if (targetPositionId) {
      if (!graph.positions.has(targetPositionId)) {
        return {
          startPositionId,
          reason: 'noTargets',
          recommendations: [],
        };
      }
      targetIds = [targetPositionId];
    } else {
      targetIds = this.pickTargets(
        graph,
        startPositionId,
        maxDepth,
        interests,
        scenario,
      );
      if (targetIds.length === 0) {
        return {
          startPositionId,
          reason: 'noTargets',
          recommendations: [],
        };
      }
    }

    const paths = this.beamSearchPaths(
      graph,
      startPositionId,
      targetIds,
      maxDepth,
      skillMap,
      scenario,
    );
    if (paths.length === 0) {
      return {
        startPositionId,
        reason: 'noPaths',
        recommendations: [],
      };
    }

    const scored = this.scorePaths(
      paths,
      graph,
      skillMap,
      interests,
      historyRows,
      scenario,
    );
    const sortedByOverall = scored.sort((a, b) => b.overall - a.overall);
    const withDiversity = this.diversityRerank(sortedByOverall, limit);
    const recommendations: RecommendationItemDto[] = withDiversity.map((s) =>
      this.buildRecommendationItem(s, graph),
    );

    return {
      startPositionId,
      reason: 'ok',
      recommendations,
    };
  }

  private pickTargets(
    graph: GraphData,
    startId: string,
    maxDepth: number,
    interests: PrismaInterestType[],
    scenario: CareerScenarioType,
  ): string[] {
    const startPos = graph.positions.get(startId);
    if (!startPos) return [];
    const dist = new Map<string, number>();
    const queue: { id: string; d: number }[] = [{ id: startId, d: 0 }];
    dist.set(startId, 0);
    while (queue.length > 0) {
      const { id, d } = queue.shift()!;
      if (d >= maxDepth) continue;
      for (const e of graph.byFrom.get(id) ?? []) {
        if (!dist.has(e.toPositionId)) {
          dist.set(e.toPositionId, d + 1);
          queue.push({ id: e.toPositionId, d: d + 1 });
        }
      }
    }
    const candidates = Array.from(dist.entries())
      .filter(([id]) => id !== startId)
      .map(([id]) => {
        const pos = graph.positions.get(id)!;
        const levelDiff = pos.level - startPos.level;
        const departmentInterest = this.departmentToInterest(pos.department);
        const interestMatch =
          departmentInterest && interests.includes(departmentInterest);
        const levelScore =
          levelDiff >= 0 && levelDiff <= 2 ? 2 : levelDiff > 2 ? 1 : 0;
        const distScore = maxDepth - (dist.get(id) ?? maxDepth);
        const isMgmt = isManagementTarget(pos.department, pos.title);
        const mgmtBoost = scenario === 'MANAGER_PATH' && isMgmt ? 4 : 0;
        return {
          id,
          pos,
          levelDiff,
          interestMatch: interestMatch ? 3 : 0,
          levelScore,
          distScore,
          mgmtBoost,
        };
      })
      .filter((c) => c.levelDiff >= 0 || c.pos.level >= startPos.level - 1);

    candidates.sort((a, b) => {
      if (b.mgmtBoost !== a.mgmtBoost) return b.mgmtBoost - a.mgmtBoost;
      if (b.interestMatch !== a.interestMatch)
        return b.interestMatch - a.interestMatch;
      if (scenario === 'FAST_GROWTH' && b.levelScore !== a.levelScore)
        return b.levelScore - a.levelScore;
      if (b.levelScore !== a.levelScore) return b.levelScore - a.levelScore;
      return b.distScore - a.distScore;
    });
    return candidates.slice(0, MAX_TARGETS).map((c) => c.id);
  }

  private departmentToInterest(department: string): PrismaInterestType | null {
    const key = Object.keys(DEPARTMENT_TO_INTEREST).find(
      (k) => k.toLowerCase() === department.toLowerCase(),
    );
    return (
      key ? DEPARTMENT_TO_INTEREST[key] : null
    ) as PrismaInterestType | null;
  }

  private edgeReadiness(
    edge: TransitionEdge,
    skillMap: Map<string, number>,
  ): number {
    if (edge.requiredSkills.length === 0) return 1;
    let sum = 0;
    for (const s of edge.requiredSkills) {
      const level = skillMap.get(s.id) ?? 0;
      sum += Math.min(level, SKILL_SUFFICIENT_LEVEL) / SKILL_SUFFICIENT_LEVEL;
    }
    return sum / edge.requiredSkills.length;
  }

  /** Key by transition ids for stable path dedup (not from→to). */
  private pathKey(path: PathStep[]): string {
    return path.map((p) => p.transition.id ?? 'unknown').join('|');
  }

  private beamSearchPaths(
    graph: GraphData,
    startId: string,
    targetIds: Set<string> | string[],
    maxDepth: number,
    skillMap: Map<string, number>,
    scenario: CareerScenarioType,
  ): PathStep[][] {
    const targetSet = new Set(targetIds);
    const results: PathStep[][] = [];
    const seenPathKeys = new Set<string>();
    const countByTarget = new Map<string, number>();
    type State = { path: PathStep[]; node: string; visited: Set<string> };
    let beam: State[] = [
      { path: [], node: startId, visited: new Set([startId]) },
    ];

    // Both global (MAX_PATHS_GLOBAL) and per-target (MAX_CANDIDATES_PER_TARGET) caps apply; per-target check is before push.
    for (
      let depth = 0;
      depth < maxDepth && results.length < MAX_PATHS_GLOBAL;
      depth++
    ) {
      const nextBeam: State[] = [];
      const nextBeamKeys = new Set<string>();
      for (const { path, node, visited } of beam) {
        const edges = graph.byFrom.get(node) ?? [];
        for (const e of edges) {
          if (visited.has(e.toPositionId)) continue;
          const newPath = [
            ...path,
            { transition: e, toPositionId: e.toPositionId },
          ];
          const key = this.pathKey(newPath);
          if (targetSet.has(e.toPositionId)) {
            if (seenPathKeys.has(key)) continue;
            const perTarget = countByTarget.get(e.toPositionId) ?? 0;
            if (perTarget >= MAX_CANDIDATES_PER_TARGET) continue;
            seenPathKeys.add(key);
            countByTarget.set(e.toPositionId, perTarget + 1);
            results.push(newPath);
            if (results.length >= MAX_PATHS_GLOBAL) break;
          } else {
            if (nextBeamKeys.has(key)) continue;
            nextBeamKeys.add(key);
            nextBeam.push({
              path: newPath,
              node: e.toPositionId,
              visited: new Set([...visited, e.toPositionId]),
            });
          }
        }
      }
      const readinessA = (p: PathStep[]) => this.pathReadinessAvg(p, skillMap);
      const changePenalty =
        scenario === 'EXPERT_PATH'
          ? (p: PathStep[]) =>
              p.filter((s) => s.transition.type === 'CHANGE').length *
              PENALTY_CHANGE_PER_EDGE
          : () => 0;
      nextBeam.sort((a, b) => {
        let heurA =
          W_BEAM_LENGTH * a.path.length -
          W_BEAM_EDGE_READINESS * readinessA(a.path);
        let heurB =
          W_BEAM_LENGTH * b.path.length -
          W_BEAM_EDGE_READINESS * readinessA(b.path);
        heurA += changePenalty(a.path);
        heurB += changePenalty(b.path);
        return heurA - heurB;
      });
      beam = nextBeam.slice(0, BEAM_SIZE);
    }
    return results;
  }

  private diversityRerank(sorted: ScoredPath[], limit: number): ScoredPath[] {
    const out: ScoredPath[] = [];
    const addedKeys = new Set<string>();
    const countByTarget = new Map<string, number>();
    for (const s of sorted) {
      if (out.length >= limit) break;
      const n = countByTarget.get(s.targetPositionId) ?? 0;
      if (n >= MAX_UNIQUE_TARGETS_IN_TOP) continue;
      const key = this.pathKey(s.path);
      if (addedKeys.has(key)) continue;
      addedKeys.add(key);
      countByTarget.set(s.targetPositionId, n + 1);
      out.push(s);
    }
    if (out.length < limit) {
      for (const s of sorted) {
        if (out.length >= limit) break;
        const key = this.pathKey(s.path);
        if (addedKeys.has(key)) continue;
        addedKeys.add(key);
        out.push(s);
      }
    }
    return out;
  }

  private pathReadinessAvg(
    path: PathStep[],
    skillMap: Map<string, number>,
  ): number {
    if (path.length === 0) return 1;
    let sum = 0;
    for (const p of path) {
      sum += this.edgeReadiness(p.transition, skillMap);
    }
    const raw = sum / path.length;
    return Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0;
  }

  private scorePaths(
    paths: PathStep[][],
    graph: GraphData,
    skillMap: Map<string, number>,
    interests: PrismaInterestType[],
    history: {
      fromPositionId: string | null;
      toPositionId: string;
      createdAt: Date;
      transitionType: string | null;
    }[],
    scenario: CareerScenarioType,
  ): ScoredPath[] {
    const weights = SCENARIO_WEIGHTS[scenario];
    const scored: ScoredPath[] = [];
    const timeCosts: number[] = [];

    for (const path of paths) {
      const unionSkills = this.unionRequiredSkills(path, skillMap);
      const { reachabilityAvg, reachabilityMin, difficulty, timeCost } =
        this.pathMetrics(path, unionSkills, skillMap);
      const interestFit = this.computeInterestFit(path, graph, interests);
      const historyBias = this.computeHistoryBias(path, history);
      let scenarioBonus = 0;
      const verticalCount = path.filter(
        (p) => p.transition.type === 'VERTICAL',
      ).length;
      const changeCount = path.filter(
        (p) => p.transition.type === 'CHANGE',
      ).length;
      if (scenario === 'FAST_GROWTH') {
        scenarioBonus += verticalCount * BONUS_VERTICAL_PER_EDGE;
      } else if (scenario === 'EXPERT_PATH') {
        scenarioBonus -= changeCount * PENALTY_CHANGE_PER_EDGE;
      } else if (scenario === 'MANAGER_PATH') {
        const targetPos = graph.positions.get(
          path[path.length - 1].toPositionId,
        );
        if (
          targetPos &&
          isManagementTarget(targetPos.department, targetPos.title)
        ) {
          scenarioBonus += MANAGER_BONUS_IF_TARGET_MGMT;
        }
        for (const step of path) {
          const toPos = graph.positions.get(step.toPositionId);
          if (toPos && isManagementTarget(toPos.department, toPos.title)) {
            scenarioBonus += MANAGER_BONUS_IF_EDGE_TO_MGMT;
            break;
          }
        }
      }
      timeCosts.push(timeCost);
      const cappedHistory = Math.max(
        -HISTORY_BIAS_CAP,
        Math.min(HISTORY_BIAS_CAP, historyBias),
      );
      scored.push({
        path,
        targetPositionId: path[path.length - 1].toPositionId,
        reachabilityAvg,
        reachabilityMin,
        difficulty,
        timeCost,
        interestFit,
        historyBias: cappedHistory,
        scenarioBonus,
        overall: 0,
        timeNorm: 0,
        unionSkills,
      });
    }

    const minT = Math.min(...timeCosts);
    const maxT = Math.max(...timeCosts);
    const range = maxT - minT;
    for (const s of scored) {
      s.timeNorm =
        range === 0 ? TIME_NORM_WHEN_EQUAL : (s.timeCost - minT) / range;
      s.overall =
        weights.W_REACHABILITY * s.reachabilityAvg -
        weights.W_TIME * s.timeNorm -
        weights.W_DIFFICULTY * s.difficulty +
        weights.W_INTEREST * s.interestFit +
        s.historyBias +
        s.scenarioBonus;
    }
    return scored;
  }

  private unionRequiredSkills(
    path: PathStep[],
    skillMap: Map<string, number>,
  ): Map<string, UnionSkillMeta> {
    const union = new Map<string, UnionSkillMeta>();
    for (const { transition } of path) {
      for (const s of transition.requiredSkills) {
        const requiredLevel = SKILL_SUFFICIENT_LEVEL;
        const existing = union.get(s.id);
        if (!existing || requiredLevel > existing.requiredLevel) {
          const level = skillMap.get(s.id) ?? 0;
          const ready = Math.min(level, requiredLevel) / requiredLevel;
          const deficit = 1 - ready;
          union.set(s.id, {
            requiredLevel,
            name: s.name,
            category: s.category,
            deficit,
          });
        }
      }
    }
    return union;
  }

  private pathMetrics(
    path: PathStep[],
    unionSkills: Map<string, UnionSkillMeta>,
    skillMap: Map<string, number>,
  ): {
    reachabilityAvg: number;
    reachabilityMin: number;
    difficulty: number;
    timeCost: number;
  } {
    if (unionSkills.size === 0) {
      const timeCost = path.length * BASE_STEP_COST;
      return {
        reachabilityAvg: 1,
        reachabilityMin: 1,
        difficulty: 0,
        timeCost,
      };
    }
    let sumReady = 0;
    let sumDeficit = 0;
    for (const [, meta] of unionSkills) {
      sumReady += 1 - meta.deficit;
      sumDeficit += meta.deficit;
    }
    const n = unionSkills.size;
    const reachabilityAvg = sumReady / n;
    const difficulty = sumDeficit / n;

    let reachabilityMin = 1;
    for (const { transition } of path) {
      if (transition.requiredSkills.length === 0) continue;
      let edgeSum = 0;
      for (const s of transition.requiredSkills) {
        const level = skillMap.get(s.id) ?? 0;
        edgeSum +=
          Math.min(level, SKILL_SUFFICIENT_LEVEL) / SKILL_SUFFICIENT_LEVEL;
      }
      reachabilityMin = Math.min(
        reachabilityMin,
        edgeSum / transition.requiredSkills.length,
      );
    }

    let timeCost = path.length * BASE_STEP_COST;
    for (const { transition } of path) {
      if (transition.requiredSkills.length === 0) {
        timeCost += BASE_STEP_COST;
        continue;
      }
      let edgeEffort = 0;
      for (const s of transition.requiredSkills) {
        const level = skillMap.get(s.id) ?? 0;
        const ready =
          Math.min(level, SKILL_SUFFICIENT_LEVEL) / SKILL_SUFFICIENT_LEVEL;
        const deficit = 1 - ready;
        const penalty = level === 0 ? 1.25 : 1;
        edgeEffort += deficit * penalty;
      }
      timeCost += edgeEffort;
    }
    timeCost += TIME_COST_ALPHA * difficulty * path.length;

    return {
      reachabilityAvg,
      reachabilityMin,
      difficulty,
      timeCost,
    };
  }

  private computeInterestFit(
    path: PathStep[],
    graph: GraphData,
    interests: PrismaInterestType[],
  ): number {
    if (path.length === 0) return INTEREST_FIT_NEUTRAL;
    const targetPos = graph.positions.get(path[path.length - 1].toPositionId);
    let signal1 = 0;
    if (targetPos) {
      const deptInterest = this.departmentToInterest(targetPos.department);
      if (deptInterest && interests.includes(deptInterest)) signal1 = 1;
    }
    let signal2 = 0;
    const categoriesOnPath = new Set<string>();
    for (const { transition } of path) {
      for (const s of transition.requiredSkills) {
        if (s.category) categoriesOnPath.add(s.category);
      }
    }
    for (const interest of interests) {
      const cat = interest.toLowerCase();
      if (
        Array.from(categoriesOnPath).some((c) => c?.toLowerCase().includes(cat))
      ) {
        signal2 = 0.5;
        break;
      }
    }
    let signal3 = 0;
    const typesOnPath = path.map((p) => p.transition.type);
    if (
      interests.includes('MANAGEMENT') &&
      typesOnPath.some((t) => t === 'VERTICAL')
    )
      signal3 = 0.3;
    const maxSignal = Math.max(signal1, signal2, signal3);
    return maxSignal > 0 ? maxSignal : INTEREST_FIT_NEUTRAL;
  }

  private computeHistoryBias(
    path: PathStep[],
    history: {
      fromPositionId: string | null;
      toPositionId: string;
      createdAt: Date;
      transitionType: string | null;
    }[],
  ): number {
    if (history.length === 0) return 0;
    const pathNodes = new Set<string>();
    pathNodes.add(path[0].transition.fromPositionId);
    for (const p of path) pathNodes.add(p.toPositionId);
    const now = new Date();
    let penalty = 0;
    // Count a history row if path contains toPositionId (always) or fromPositionId (when non-null); initial assignment contributes via toPositionId.
    for (const h of history) {
      const fromInPath =
        h.fromPositionId != null && pathNodes.has(h.fromPositionId);
      const toInPath = pathNodes.has(h.toPositionId);
      if (!fromInPath && !toInPath) continue;
      const daysAgo =
        (now.getTime() - h.createdAt.getTime()) / (24 * 60 * 60 * 1000);
      let w = 0.1;
      if (daysAgo <= HISTORY_RECENT_DAYS) w = 0.2;
      else if (daysAgo >= HISTORY_OLD_DAYS) w = 0.03;
      penalty += w;
    }
    if (history.length >= 2) {
      const [a] = history;
      const lastPair = `${a.fromPositionId ?? ''}:${a.toPositionId}`;
      for (let i = 0; i < path.length; i++) {
        const from = path[i].transition.fromPositionId;
        const to = path[i].toPositionId;
        if (`${to}:${from}` === lastPair) {
          penalty += 0.15;
          break;
        }
      }
    }
    const verticalCount = history.filter(
      (h) => h.transitionType === 'VERTICAL',
    ).length;
    const bonus =
      verticalCount > history.length / 2 &&
      path.some((p) => p.transition.type === 'VERTICAL')
        ? 0.05
        : 0;
    return Math.max(
      -HISTORY_BIAS_CAP,
      Math.min(HISTORY_BIAS_CAP, bonus - penalty),
    );
  }

  private buildRecommendationItem(
    scored: ScoredPath,
    graph: GraphData,
  ): RecommendationItemDto {
    const targetPos = graph.positions.get(scored.targetPositionId)!;
    const topMissing: SkillDeficitDto[] = Array.from(
      scored.unionSkills.entries(),
    )
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        deficitPercent: Math.round(meta.deficit * 100),
      }))
      .filter((s) => (s.deficitPercent ?? 0) > 0)
      .sort((a, b) => (b.deficitPercent ?? 0) - (a.deficitPercent ?? 0))
      .slice(0, 5);

    const topContributors: SkillDeficitDto[] = Array.from(
      scored.unionSkills.entries(),
    )
      .map(([id, meta]) => ({
        id,
        name: meta.name,
        deficitPercent: Math.round(meta.deficit * 100),
      }))
      .filter((s) => s.deficitPercent > 0)
      .sort((a, b) => b.deficitPercent - a.deficitPercent)
      .slice(0, 3);

    const notes: string[] = [];
    notes.push(
      `Reachability ${scored.reachabilityAvg.toFixed(2)} (avg), bottleneck ${scored.reachabilityMin.toFixed(2)}`,
    );
    notes.push(`Estimated effort ${scored.timeCost.toFixed(1)}`);
    if (scored.interestFit >= 0.5) notes.push('Aligns with your interests');
    if (scored.path.length <= 2) notes.push('Short path');
    if (scored.historyBias > 0) notes.push('Matches your transition trend');

    const scores: PathScoresDto = {
      reachability: Math.round(scored.reachabilityAvg * 100),
      reachabilityMin: Math.round(scored.reachabilityMin * 100),
      difficulty: Math.round(scored.difficulty * 100),
      timeCost: Math.round(scored.timeCost * 10) / 10,
      interestFit: Math.round(scored.interestFit * 100),
      overall: Math.round(scored.overall * 100) / 100,
    };

    return {
      targetPosition: {
        id: targetPos.id,
        title: targetPos.title,
        level: targetPos.level,
        department: targetPos.department,
      },
      transitions: scored.path.map((p) => ({
        id: p.transition.id,
        fromPositionId: p.transition.fromPositionId,
        toPositionId: p.transition.toPositionId,
        type: p.transition.type,
      })),
      scores,
      explanation: {
        topMissingSkills: topMissing,
        topContributors,
        notes,
      },
    };
  }
}
