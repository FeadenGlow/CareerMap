import type { TransitionType, Transition } from '@entities/transition/types';

export interface ScenarioThemeForGraph {
  highlightColor: string;
}

export const getEdgeColor = (
  type: TransitionType,
  isRecommended?: boolean,
  isPartiallyAvailable?: boolean,
): string => {
  if (isRecommended) {
    return '#10b981';
  }
  if (isPartiallyAvailable) {
    return '#fbbf24';
  }

  switch (type) {
    case 'VERTICAL':
      return '#10b981';
    case 'HORIZONTAL':
      return '#3b82f6';
    case 'CHANGE':
      return '#f97316';
    default:
      return '#6b7280';
  }
};

export interface GetEdgeStyleOptions {
  scenarioTheme?: ScenarioThemeForGraph;
  recommendedWeight?: number;
}

export const getEdgeStyle = (
  transition: Transition,
  options?: GetEdgeStyleOptions,
) => {
  const { scenarioTheme, recommendedWeight } = options ?? {};
  const useScenarioHighlight =
    scenarioTheme && recommendedWeight !== undefined && recommendedWeight > 0;

  const baseColor = useScenarioHighlight
    ? scenarioTheme.highlightColor
    : getEdgeColor(
        transition.type,
        transition.isRecommended,
        transition.isPartiallyAvailable,
      );

  const baseWidth = transition.isRecommended
    ? 3
    : transition.isPartiallyAvailable
      ? 2.5
      : 2;
  const width = useScenarioHighlight
    ? Math.min(4, baseWidth + 0.5 * Math.min(2, recommendedWeight))
    : baseWidth;

  return {
    stroke: baseColor,
    strokeWidth: width,
    strokeDasharray: transition.isPartiallyAvailable ? '5,5' : undefined,
    opacity: useScenarioHighlight
      ? 0.6 + 0.4 * Math.min(1, recommendedWeight)
      : 1,
  };
};
