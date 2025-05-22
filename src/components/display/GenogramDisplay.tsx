import React from 'react';
import { Edge, Node, OnNodesChange, ReactFlowProvider, ReactFlow as XYFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GenogramDisplayProps {
  nodes: Node[];
  edges: Edge[]; // Assuming Edge type from React Flow, which should include id, source, target, and optionally type or data.type
  nodeTypes: any; // Consider defining a more specific type if available
  onNodesChange: OnNodesChange;
  onEdgeEdit?: (edge: Edge) => void; // Prop for handling edge edits
  onEdgeTransfer?: (oldEdge: Edge, newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => void; // Prop for handling edge transfers
}

const GenogramDisplay: React.FC<GenogramDisplayProps> = ({ nodes, edges, nodeTypes, onNodesChange, onEdgeEdit, onEdgeTransfer }) => {
  
  const handleEdgeUpdateStart = React.useCallback((event, edge: Edge) => {
    console.log('Edge update started:', edge);
    // Potentially use this to change edge appearance during drag
  }, []);

  const handleEdgeUpdate = React.useCallback((oldEdge: Edge, newConnection: any) => {
    // newConnection usually has { source, target, sourceHandle, targetHandle }
    // oldEdge is the original edge object
    if (onEdgeTransfer) {
      onEdgeTransfer(oldEdge, newConnection);
    }
    // Note: React Flow internally handles the edge update in its state if this function
    // doesn't throw or prevent default. We are just intercepting the event.
    // The actual update of *our* state (relationships in useGenogramState)
    // will happen in App.js via the onEdgeTransfer callback.
  }, [onEdgeTransfer]);

  const handleEdgeUpdateEnd = React.useCallback((event, edge: Edge, cancelled: boolean) => {
    console.log('Edge update ended. Cancelled:', cancelled, edge);
    // Clean up any visual state if onEdgeUpdateStart was used to set one
  }, []);
  
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
          onConnect={(params) => console.log('Connection params:', params)}
          onEdgeClick={(event, edge) => {
            if (onEdgeEdit) {
              const clickedEdgeData = edges.find(e => e.id === edge.id);
              if (clickedEdgeData) {
                onEdgeEdit(clickedEdgeData);
              } else {
                console.warn(`Edge with ID ${edge.id} clicked but not found in provided 'edges' prop. Edit not triggered.`);
              }
            }
          }}
          onEdgeUpdateStart={handleEdgeUpdateStart}
          onEdgeUpdate={handleEdgeUpdate}
          onEdgeUpdateEnd={handleEdgeUpdateEnd}
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
