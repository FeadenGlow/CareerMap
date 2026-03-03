import { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import type { NodeMouseHandler, EdgeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { buildGraph } from '../lib/buildGraph';
import { nodeTypes, edgeTypes } from '../model/graph-config';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';
import type { ScenarioThemeForGraph } from '../lib/graphStyles';

interface CareerGraphProps {
  positions: Position[];
  transitions: Transition[];
  onNodeClick?: (position: Position) => void;
  onEdgeClick?: (transition: Transition) => void;
  recommendedTransitionFrequency?: Map<string, number>;
  scenarioTheme?: ScenarioThemeForGraph;
}

export const CareerGraph = ({
  positions,
  transitions,
  onNodeClick,
  onEdgeClick,
  recommendedTransitionFrequency,
  scenarioTheme,
}: CareerGraphProps) => {
  const { nodes, edges } = useMemo(
    () =>
      buildGraph(positions, transitions, {
        recommendedTransitionFrequency,
        scenarioTheme,
      }),
    [positions, transitions, recommendedTransitionFrequency, scenarioTheme],
  );

  const transitionById = useMemo(
    () => new Map(transitions.map((t) => [t.id, t])),
    [transitions],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (onNodeClick && node.data?.position) {
        onNodeClick(node.data.position);
      }
    },
    [onNodeClick],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      const transition = transitionById.get(edge.id);
      if (onEdgeClick && transition) {
        onEdgeClick(transition);
      }
    },
    [onEdgeClick, transitionById],
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
