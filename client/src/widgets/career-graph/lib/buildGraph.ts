import type { Node, Edge } from 'reactflow';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';
import { getEdgeStyle } from './graphStyles';
import React from 'react';

export const buildGraph = (positions: Position[], transitions: Transition[]): { nodes: Node[]; edges: Edge[] } => {
  const levelGroups = positions.reduce((acc, position) => {
    if (!acc[position.level]) {
      acc[position.level] = [];
    }
    acc[position.level].push(position);
    return acc;
  }, {} as Record<number, Position[]>);

  const nodes: Node[] = [];

  Object.keys(levelGroups)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((level, levelIndex) => {
      const positionsInLevel = levelGroups[level];
      const positionsCount = positionsInLevel.length;
      const startX = levelIndex * 300;
      const spacing = positionsCount > 1 ? 200 : 0;

      positionsInLevel.forEach((position, index) => {
        const x = startX;
        const y = (index - (positionsCount - 1) / 2) * spacing;

        nodes.push({
          id: position.id,
          type: 'default',
          position: { x, y },
          data: {
            label: React.createElement(
              'div',
              { className: 'text-center' },
              React.createElement('div', { className: 'font-semibold' }, position.title),
              React.createElement('div', { className: 'text-xs text-gray-500' }, position.department),
              React.createElement('div', { className: 'text-xs text-gray-400' }, `Level ${position.level}`)
            ),
            position,
          },
        });
      });
    });

  const edges: Edge[] = transitions.map((transition) => {
    const edgeStyle = getEdgeStyle(transition);
    const labelText = transition.isRecommended 
      ? `✓ ${transition.type}` 
      : transition.isPartiallyAvailable 
      ? `⚠ ${transition.type}` 
      : transition.type;
    
    return {
      id: transition.id,
      source: transition.fromPositionId,
      target: transition.toPositionId,
      label: labelText,
      style: edgeStyle,
      labelStyle: { 
        fill: edgeStyle.stroke, 
        fontWeight: transition.isRecommended ? 700 : 600,
        fontSize: transition.isRecommended ? '12px' : '11px',
      },
    };
  });

  return { nodes, edges };
};

