import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@app/config/routes';
import { useAuth } from '@app/providers/AuthProvider';
import { CareerGraph } from '@widgets/career-graph/ui/CareerGraph';
import { careerPathsApi } from '../api/careerPathsApi';
import type {
  CareerGraph as CareerGraphType,
  CareerRecommendationsResponse,
  RecommendationItem,
} from '../api/careerPathsApi';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';
import { Modal } from '@shared/ui/Modal';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { LoadingSpinner } from '@shared/ui/LoadingSpinner';
import { ErrorMessage } from '@shared/ui/ErrorMessage';
import { positionApi } from '@entities/position/api/positionApi';
import { careerScenariosApi } from '@features/career-scenarios/api/careerScenariosApi';
import type {
  CareerScenarioType,
  ScenarioInfo,
} from '@features/career-scenarios/types';
import { DEFAULT_SCENARIO_THEMES } from '@features/career-scenarios/constants';

const MAX_SKILLS_VISIBLE = 5;

export const CareerPathView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [graph, setGraph] = useState<CareerGraphType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [positionDetails, setPositionDetails] = useState<any>(null);
  const [selectedTransition, setSelectedTransition] =
    useState<Transition | null>(null);
  const [expandMissing, setExpandMissing] = useState(false);
  const [expandPartial, setExpandPartial] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [activeScenario, setActiveScenario] =
    useState<CareerScenarioType>('FAST_GROWTH');
  const [scenarioSaveError, setScenarioSaveError] = useState<string | null>(
    null,
  );
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [recommendations, setRecommendations] =
    useState<CareerRecommendationsResponse | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const scenarioRequestIdRef = useRef(0);
  const activeScenarioRef = useRef<CareerScenarioType>(activeScenario);

  useEffect(() => {
    activeScenarioRef.current = activeScenario;
  }, [activeScenario]);

  const loadScenarios = useCallback(async () => {
    try {
      setScenariosLoading(true);
      const data = await careerScenariosApi.getScenarios();
      setScenarios(data.scenarios);
      setActiveScenario(data.activeScenario);
      setScenarioSaveError(null);
    } catch {
      setScenarios([]);
    } finally {
      setScenariosLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, []);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const loadRecommendations = useCallback(
    async (forScenario?: CareerScenarioType) => {
      setRecommendationsLoading(true);
      try {
        const data = await careerPathsApi.getRecommendations();
        const stillRelevant =
          forScenario === undefined ||
          activeScenarioRef.current === forScenario;
        if (stillRelevant) {
          setRecommendations(data);
        }
        if (stillRelevant) {
          setRecommendationsLoading(false);
        }
      } catch {
        if (
          forScenario === undefined ||
          activeScenarioRef.current === forScenario
        ) {
          setRecommendations(null);
          setRecommendationsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (graph) {
      loadRecommendations();
    }
  }, [graph, loadRecommendations]);

  const loadGraph = async () => {
    try {
      setError(null);
      const data = await careerPathsApi.getCareerGraph();
      setGraph(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load career graph');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (position: Position) => {
    setSelectedPosition(position);
    setSelectedTransition(null);
    try {
      const details = await positionApi.getById(position.id);
      setPositionDetails(details);
    } catch (err: any) {
      console.error('Failed to load position details:', err);
    }
  };

  const handleEdgeClick = (transition: Transition) => {
    setSelectedTransition(transition);
    setSelectedPosition(null);
    setExpandMissing(false);
    setExpandPartial(false);
  };

  const getPositionTitle = (positionId: string): string => {
    if (!graph) return positionId;
    const pos = graph.positions.find((p) => p.id === positionId);
    return pos?.title ?? positionId;
  };

  const recommendedTransitionFrequency = useMemo(() => {
    const map = new Map<string, number>();
    if (!recommendations?.recommendations?.length) return map;
    for (const rec of recommendations.recommendations) {
      for (const t of rec.transitions) {
        map.set(t.id, (map.get(t.id) ?? 0) + 1);
      }
    }
    return map;
  }, [recommendations]);

  const scenarioThemeForGraph = useMemo(() => {
    const s = scenarios.find((sc) => sc.type === activeScenario);
    const defaults = DEFAULT_SCENARIO_THEMES[activeScenario];
    const highlight = s?.theme?.highlight ?? defaults.highlight;
    const accent = s?.theme?.accent ?? defaults.accent;
    return { highlightColor: highlight, accent };
  }, [scenarios, activeScenario]);

  const handleScenarioChange = (scenario: CareerScenarioType) => {
    const previous = activeScenario;
    const requestId = ++scenarioRequestIdRef.current;
    setActiveScenario(scenario);
    setScenarioSaveError(null);
    careerScenariosApi
      .setActiveScenario(scenario)
      .then(() => {
        if (requestId !== scenarioRequestIdRef.current) return;
        setScenarioSaveError(null);
        loadRecommendations(scenario);
      })
      .catch(() => {
        if (requestId !== scenarioRequestIdRef.current) return;
        setActiveScenario(previous);
        setScenarioSaveError('Failed to save scenario. Reverted.');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message={error} />
        <Button onClick={loadGraph} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message="No career graph data available" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Career Paths</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.PROFILE)}
              >
                Profile
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.DEVELOPMENT)}
              >
                Development
              </Button>
              {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(ROUTES.ADMIN_POSITIONS)}
                >
                  Admin
                </Button>
              )}
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">
              Career Path Visualization
            </h2>
            {!scenariosLoading && scenarios.length > 0 && (
              <div className="mb-4">
                <div
                  className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg mb-2"
                  role="tablist"
                  aria-label="Career scenario"
                >
                  {scenarios.map((s) => (
                    <button
                      key={s.type}
                      type="button"
                      role="tab"
                      aria-selected={activeScenario === s.type}
                      onClick={() => handleScenarioChange(s.type)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeScenario === s.type
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {
                    scenarios.find((s) => s.type === activeScenario)
                      ?.description
                  }
                </p>
                {scenarioSaveError && (
                  <p className="text-sm text-red-600 mt-1">
                    {scenarioSaveError}
                  </p>
                )}
              </div>
            )}
            {recommendationsLoading && (
              <p className="text-sm text-gray-500 mb-2">
                Loading recommendations…
              </p>
            )}
            {!recommendationsLoading &&
              recommendations?.reason === 'ok' &&
              recommendations.recommendations.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Top Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.recommendations.map(
                      (rec: RecommendationItem, idx: number) => (
                        <li
                          key={`${rec.targetPosition.id}-${idx}`}
                          className="text-sm flex justify-between items-start gap-2"
                        >
                          <span className="font-medium text-gray-900">
                            {rec.targetPosition.title}
                          </span>
                          <span className="text-gray-500 shrink-0">
                            {rec.transitions.length} step
                            {rec.transitions.length !== 1 ? 's' : ''} · score{' '}
                            {rec.scores.overall.toFixed(1)}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span>Vertical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span>Horizontal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-500"></div>
                <span>Change</span>
              </div>
            </div>
          </div>
          <CareerGraph
            positions={graph.positions}
            transitions={graph.transitions}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            recommendedTransitionFrequency={
              recommendedTransitionFrequency.size > 0
                ? recommendedTransitionFrequency
                : undefined
            }
            scenarioTheme={scenarioThemeForGraph}
          />
        </Card>
      </div>

      <Modal
        isOpen={!!selectedPosition}
        onClose={() => setSelectedPosition(null)}
        title={selectedPosition?.title}
      >
        {positionDetails && (
          <div className="space-y-4">
            <div>
              <strong>Department:</strong> {positionDetails.department}
            </div>
            <div>
              <strong>Level:</strong> {positionDetails.level}
            </div>
            {positionDetails.from && positionDetails.from.length > 0 && (
              <div>
                <strong>Available Transitions:</strong>
                <ul className="list-disc list-inside mt-2">
                  {positionDetails.from.map((transition: any) => (
                    <li key={transition.id}>
                      {transition.toPosition.title} ({transition.type})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedTransition}
        onClose={() => setSelectedTransition(null)}
        title={
          selectedTransition
            ? `${getPositionTitle(selectedTransition.fromPositionId)} → ${getPositionTitle(selectedTransition.toPositionId)}`
            : ''
        }
      >
        {selectedTransition && (
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-semibold mb-2">
                Readiness: {selectedTransition.readinessPercent ?? 0}%
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (selectedTransition.readinessPercent ?? 0) >= 80
                      ? 'bg-green-500'
                      : (selectedTransition.readinessPercent ?? 0) >= 50
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(100, selectedTransition.readinessPercent ?? 0)}%`,
                  }}
                />
              </div>
            </div>
            {selectedTransition.missingSkills &&
              selectedTransition.missingSkills.length > 0 && (
                <div>
                  <strong>Missing:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(expandMissing
                      ? selectedTransition.missingSkills
                      : selectedTransition.missingSkills.slice(
                          0,
                          MAX_SKILLS_VISIBLE,
                        )
                    ).map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-sm bg-red-100 text-red-800"
                      >
                        {s.name}
                      </span>
                    ))}
                    {!expandMissing &&
                      selectedTransition.missingSkills.length >
                        MAX_SKILLS_VISIBLE && (
                        <button
                          type="button"
                          onClick={() => setExpandMissing(true)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          +
                          {selectedTransition.missingSkills.length -
                            MAX_SKILLS_VISIBLE}{' '}
                          more
                        </button>
                      )}
                  </div>
                </div>
              )}
            {selectedTransition.partialSkills &&
              selectedTransition.partialSkills.length > 0 && (
                <div>
                  <strong>Needs improvement:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(expandPartial
                      ? selectedTransition.partialSkills
                      : selectedTransition.partialSkills.slice(
                          0,
                          MAX_SKILLS_VISIBLE,
                        )
                    ).map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-sm bg-amber-100 text-amber-800"
                        title={`${s.userLevel}% (need ${s.requiredLevel ?? 70})`}
                      >
                        {s.name} ({s.userLevel}%)
                      </span>
                    ))}
                    {!expandPartial &&
                      selectedTransition.partialSkills.length >
                        MAX_SKILLS_VISIBLE && (
                        <button
                          type="button"
                          onClick={() => setExpandPartial(true)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          +
                          {selectedTransition.partialSkills.length -
                            MAX_SKILLS_VISIBLE}{' '}
                          more
                        </button>
                      )}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};
