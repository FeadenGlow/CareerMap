import { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import type { NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { buildGraph } from '../lib/buildGraph';
import { nodeTypes, edgeTypes } from '../model/graph-config';
import type { Position } from '@entities/position/types';
import type { Transition } from '@entities/transition/types';

interface CareerGraphProps {
  positions: Position[];
  transitions: Transition[];
  onNodeClick?: (position: Position) => void;
}

export const CareerGraph = ({ positions, transitions, onNodeClick }: CareerGraphProps) => {
  const { nodes, edges } = useMemo(() => buildGraph(positions, transitions), [positions, transitions]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (onNodeClick && node.data?.position) {
        onNodeClick(node.data.position);
      }
    },
    [onNodeClick]
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodeClick={handleNodeClick} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

