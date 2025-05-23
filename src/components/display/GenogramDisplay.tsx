import React, { useRef, useState } from 'react';
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
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const flowRef = useRef<HTMLDivElement>(null);
  
  const handleExport = async (format?: 'png' | 'pdf') => {
    if (!flowRef.current || isExporting) return; 
    
    setIsExporting(true); 

    // Defer the actual export to allow UI to update
    setTimeout(async () => {
      if (!flowRef.current) {
        setIsExporting(false);
        return;
      }
      // Hide controls before capturing
      const controls = flowRef.current.querySelector('.react-flow__controls');
      if (controls) {
        (controls as HTMLElement).style.visibility = 'hidden';
      }

      try {
        const exportType = format || exportFormat;
        if (exportType === 'png') {
          await exportToPng(flowRef.current as HTMLElement); 
        } else {
          await exportToPdf(flowRef.current as HTMLElement); 
        }
        
        if (onExport) {
          onExport(exportType); 
        }
      } catch (error) {
        console.error('Export failed:', error);
        // Optionally, add user feedback here (e.g., a toast notification)
      } finally {
        // Show controls again
        if (controls) {
          (controls as HTMLElement).style.visibility = '';
        }
        setIsExporting(false); 
      }
    }, 0); 
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
        <div className="relative">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'png' | 'pdf')}
            className="appearance-none pl-3 pr-8 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isExporting}
          >
            <option value="png">PNG Image</option>
            <option value="pdf">PDF Document</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        <button
          onClick={() => handleExport()}
          className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          title="Export genogram"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-1.5" />
              <span>Export</span>
            </>
          )}
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
