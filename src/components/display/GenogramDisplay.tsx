import React from 'react';
import { 
  Edge, 
  Node, 
  OnNodesChange, 
  ReactFlowProvider, 
  ReactFlow as XYFlow, 
  Background, 
  Controls, 
  ConnectionMode, 
  BackgroundVariant,
  Connection,
  ReactFlowProps,
  NodeChange,
  EdgeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesDelete
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface GenogramDisplayProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: any;
  onNodesChange: (changes: NodeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onEdgeEdit?: (edge: Edge) => void;
  onEdgeTransfer?: (oldEdge: Edge, newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => void;
}

const GenogramDisplay: React.FC<GenogramDisplayProps> = ({ 
  nodes, 
  edges, 
  nodeTypes, 
  onNodesChange, 
  onConnect,
  onEdgeEdit, 
  onEdgeTransfer 
}) => {
  
  // Edge update handlers - using type assertions to work around type issues
  const handleEdgeUpdateStart = React.useCallback((event: any, edge: Edge) => {
    console.log('Edge update started:', edge);
  }, []);

  const handleEdgeUpdate = React.useCallback((oldEdge: Edge, newConnection: any) => {
    if (onEdgeTransfer) {
      onEdgeTransfer(oldEdge, newConnection);
    }
  }, [onEdgeTransfer]);

  const handleEdgeUpdateEnd = React.useCallback((event: any, edge: Edge, cancelled: boolean) => {
    console.log('Edge update ended. Cancelled:', cancelled, edge);
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
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          snapToGrid={true}
          snapGrid={[15, 15]}
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
          // Type assertion to bypass type checking for edge update handlers
          // as they're not properly typed in the current version of @xyflow/react
          {...{
            onEdgeUpdateStart: handleEdgeUpdateStart as any,
            onEdgeUpdate: handleEdgeUpdate as any,
            onEdgeUpdateEnd: handleEdgeUpdateEnd as any
          }}
          fitView
          attributionPosition="top-right"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#aaa" />
          <Controls />
        </XYFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default GenogramDisplay;
