import React, { useRef } from 'react';
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
import { Download } from 'lucide-react';
import { exportToPng, exportToPdf } from '../../utils/exportUtils.tsx';

interface GenogramDisplayProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: any;
  onNodesChange: (changes: NodeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onEdgeEdit?: (edge: Edge) => void;
  onEdgeTransfer?: (oldEdge: Edge, newConnection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => void;
  onExport?: (format: 'png' | 'pdf') => void;
}

const GenogramDisplay: React.FC<GenogramDisplayProps> = ({ 
  nodes, 
  edges, 
  nodeTypes, 
  onNodesChange, 
  onConnect,
  onEdgeEdit, 
  onEdgeTransfer,
  onExport 
}) => {
  const flowRef = useRef<HTMLDivElement>(null);
  
  const handleExport = async (format: 'png' | 'pdf') => {
    if (!flowRef.current) return;
    
    // Hide controls before capturing
    const controls = flowRef.current.querySelector('.react-flow__controls');
    if (controls) {
      (controls as HTMLElement).style.visibility = 'hidden';
    }
    
    try {
      if (format === 'png') {
        await exportToPng(flowRef.current);
      } else {
        await exportToPdf(flowRef.current);
      }
      
      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      // Show controls again
      if (controls) {
        (controls as HTMLElement).style.visibility = '';
      }
    }
  };
  
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
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2 space-x-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => handleExport('png')}
          className="flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Export as PNG"
        >
          <Download className="w-4 h-4 mr-1" />
          <span>PNG</span>
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Export as PDF"
        >
          <Download className="w-4 h-4 mr-1 text-white" />
          <span>PDF</span>
        </button>
      </div>
      <div ref={flowRef} style={{ height: '600px', width: '100%' }} className="border border-t-0 border-gray-200 rounded-b bg-white shadow">
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
    </div>
  );
};

export default GenogramDisplay;
