export type RecommendationReason =
  | 'noStartPosition'
  | 'noGraphData'
  | 'noTargets'
  | 'noPaths'
  | 'ok';

export interface PositionDto {
  id: string;
  title: string;
  level: number;
  department: string;
}

export interface TransitionRefDto {
  id: string;
  fromPositionId: string;
  toPositionId: string;
  type: string;
}

export interface PathScoresDto {
  reachability: number;
  reachabilityMin?: number;
  difficulty: number;
  timeCost: number;
  interestFit: number;
  overall: number;
}

export interface SkillDeficitDto {
  id: string;
  name: string;
  deficitPercent?: number;
}

export interface ExplanationDto {
  topMissingSkills: SkillDeficitDto[];
  topContributors: SkillDeficitDto[];
  notes: string[];
}

export interface RecommendationItemDto {
  targetPosition: PositionDto;
  transitions: TransitionRefDto[];
  scores: PathScoresDto;
  explanation: ExplanationDto;
}

export interface CareerRecommendationsResponseDto {
  startPositionId: string | null;
  reason: RecommendationReason;
  recommendations: RecommendationItemDto[];
}
