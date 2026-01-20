import type { TransitionType, Transition } from '@entities/transition/types';

export const getEdgeColor = (type: TransitionType, isRecommended?: boolean, isPartiallyAvailable?: boolean): string => {
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

export const getEdgeStyle = (transition: Transition) => {
  const baseColor = getEdgeColor(
    transition.type,
    transition.isRecommended,
    transition.isPartiallyAvailable
  );
  
  return {
    stroke: baseColor,
    strokeWidth: transition.isRecommended ? 3 : transition.isPartiallyAvailable ? 2.5 : 2,
    strokeDasharray: transition.isPartiallyAvailable ? '5,5' : undefined,
  };
};

