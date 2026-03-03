import type { Node, Edge } from 'reactflow';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';
import { getEdgeStyle } from './graphStyles';
import type { ScenarioThemeForGraph } from './graphStyles';
import React from 'react';

export interface BuildGraphOptions {
  recommendedTransitionFrequency?: Map<string, number>;
  scenarioTheme?: ScenarioThemeForGraph;
}

export const buildGraph = (
  positions: Position[],
  transitions: Transition[],
  options?: BuildGraphOptions,
): { nodes: Node[]; edges: Edge[] } => {
  const { recommendedTransitionFrequency = new Map(), scenarioTheme } =
    options ?? {};
  const maxFreq =
    recommendedTransitionFrequency.size > 0
      ? Math.max(...recommendedTransitionFrequency.values(), 1)
      : 1;
  const levelGroups = positions.reduce(
    (acc, position) => {
      if (!acc[position.level]) {
        acc[position.level] = [];
      }
      acc[position.level].push(position);
      return acc;
    },
    {} as Record<number, Position[]>,
  );

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
              React.createElement(
                'div',
                { className: 'font-semibold' },
                position.title,
              ),
              React.createElement(
                'div',
                { className: 'text-xs text-gray-500' },
                position.department,
              ),
              React.createElement(
                'div',
                { className: 'text-xs text-gray-400' },
                `Level ${position.level}`,
              ),
            ),
            position,
          },
        });
      });
    });

  const strokeColor = (color: string) => ({ stroke: color, fill: 'none' });

  const edges: Edge[] = transitions.map((transition) => {
    const freq = recommendedTransitionFrequency.get(transition.id) ?? 0;
    const recommendedWeight = maxFreq > 0 ? freq / maxFreq : 0;
    const edgeStyle = getEdgeStyle(transition, {
      scenarioTheme,
      recommendedWeight: freq > 0 ? recommendedWeight : undefined,
    });
    const color = edgeStyle.stroke;
    const iconSize = 10;
    const checkSvg = React.createElement(
      'svg',
      {
        width: iconSize,
        height: iconSize,
        viewBox: '0 0 24 24',
        style: { verticalAlign: 'middle', marginRight: 2 },
      },
      React.createElement('path', {
        d: 'M20 6L9 17l-5-5',
        ...strokeColor(color),
        strokeWidth: 2.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    );
    const warningSvg = React.createElement(
      'svg',
      {
        width: iconSize,
        height: iconSize,
        viewBox: '0 0 24 24',
        style: { verticalAlign: 'middle', marginRight: 2 },
      },
      React.createElement('path', {
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        ...strokeColor(color),
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    );
    const typeLabel = transition.isRecommended
      ? React.createElement(React.Fragment, {}, checkSvg, ' ', transition.type)
      : transition.isPartiallyAvailable
        ? React.createElement(
            React.Fragment,
            {},
            warningSvg,
            ' ',
            transition.type,
          )
        : transition.type;
    const readiness =
      transition.readinessPercent !== undefined
        ? `${transition.readinessPercent}%`
        : null;
    const labelContent = readiness
      ? React.createElement(React.Fragment, {}, readiness, ' · ', typeLabel)
      : typeLabel;
    const tooltip =
      readiness && transition.missingSkills?.length
        ? `Missing: ${transition.missingSkills.map((s) => s.name).join(', ')}`
        : readiness
          ? `Readiness: ${readiness}`
          : undefined;

    return {
      id: transition.id,
      source: transition.fromPositionId,
      target: transition.toPositionId,
      label: tooltip
        ? React.createElement(
            'span',
            { title: tooltip, style: { cursor: 'pointer' } },
            labelContent,
          )
        : labelContent,
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
