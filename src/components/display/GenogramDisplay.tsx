import React from 'react';
import { ReactFlowProvider, ReactFlow as XYFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const GenogramDisplay = ({ nodes, edges, nodeTypes, onNodesChange }) => {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow">
        Add family members to start building your genogram.
      </div>
    );
  }
            
  return (
    <div style={{ height: '600px', width: '100%' }} className="border border-gray-200 rounded bg-white shadow">
      <ReactFlowProvider>
        <XYFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          nodesDraggable={true}
          fitView
          attributionPosition="top-right"
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
        </XYFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default GenogramDisplay;
