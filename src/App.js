import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download } from 'lucide-react'; // Kept for PDF/PNG download buttons
import { applyNodeChanges, MarkerType } from '@xyflow/react'; // MarkerType might be needed by baseEdges
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid'; // Still needed for baseEdges if rel.id is missing

// Custom Hook
import { useGenogramState } from './hooks/useGenogramState.tsx';
// Utility Functions
import { getLayoutedElements } from './utils/layout.tsx'; 

// Node Components
import MaleNode from './components/nodes/MaleNode.tsx';
import FemaleNode from './components/nodes/FemaleNode.tsx';
import DefaultNode from './components/nodes/DefaultNode.tsx';

// UI Components
import GenogramForm from './components/form/GenogramForm.tsx';
import JsonInput from './components/json/JsonInput.tsx';
import GenogramDisplay from './components/display/GenogramDisplay.tsx';
import FamilyMembersTable from './components/tables/FamilyMembersTable.tsx';
import RelationshipsTable from './components/tables/RelationshipsTable.tsx';
import RelationshipModal from './components/modal/RelationshipModal.tsx'; // Import RelationshipModal

// Constants for layout - can remain or be moved to layout.js if preferred
// const NODE_WIDTH = 150; 
// const NODE_HEIGHT = 100; 

export default function GenogramApp() {
  const [activeTab, setActiveTab] = useState('form');
  
  // State for RelationshipModal
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [currentRelationshipDetails, setCurrentRelationshipDetails] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    
  const {
    familyMembers, setFamilyMembers,
    relationships, setRelationships,
    newMember, setNewMember,
    newRelationship, setNewRelationship,
    error, setError,
    jsonInput, setJsonInput,
    handleAddMember,
    handleDeleteMember,
    handleAddRelationship, // This is the old one, might be removed if modal replaces its direct use
    handleDeleteRelationship,
    handleJsonApply,
    exportData,
    addRelationshipFromModal, // Ensure this is destructured
    updateRelationship // Destructure updateRelationship
  } = useGenogramState();

  // Node types for React Flow
  const nodeTypes = useMemo(() => ({ 
    maleNode: MaleNode, 
    femaleNode: FemaleNode, 
    defaultNode: DefaultNode 
  }), []);
  // Base nodes derived from familyMembers (state from hook)
  const baseNodes = useMemo(() => familyMembers.map((member) => ({
    id: String(member.id),
    data: { 
      name: member.name, 
      gender: member.gender, 
      birthYear: member.birthDate ? new Date(member.birthDate).getFullYear().toString() : member.birthYear, 
      deceased: member.deceased, 
      deathYear: member.deathDate ? new Date(member.deathDate).getFullYear().toString() : member.deathYear, 
      medicalConditions: member.medicalConditions 
    },
    type: member.gender === 'male' ? 'maleNode' : member.gender === 'female' ? 'femaleNode' : 'defaultNode',
    position: { x: 0, y: 0 } 
  })), [familyMembers]);

  // Base edges derived from relationships (state from hook)
  const baseEdges = useMemo(() => relationships.map((rel) => {
    const edgeStyle = {};
    let edgeMarkerEnd;
    let edgeAnimated = false;

    // Note: MarkerType needs to be imported if used here.
    // Original App.js used MarkerType in this section.
    switch (rel.type) {
      case 'married':
        edgeStyle.stroke = 'black';
        edgeStyle.strokeWidth = 3;
        break;
        case 'divorced':
          edgeStyle.stroke = 'black';
          edgeStyle.strokeWidth = 2;
          edgeStyle.strokeDasharray = '5 5';
          break;
        case 'parent-child':
          edgeStyle.stroke = 'blue';
          edgeStyle.strokeWidth = 1; 
          edgeMarkerEnd = { type: MarkerType.ArrowClosed, color: 'blue' };
          edgeAnimated = true; 
          break;
        case 'siblings':
          edgeStyle.stroke = 'green';
          edgeStyle.strokeWidth = 1;
          break;
        default:
          edgeStyle.stroke = '#b1b1b7';
          edgeStyle.strokeWidth = 1;
      }
  
      return {
        id: rel.id || uuidv4(), // uuidv4 still needed here for potential missing ids
        source: String(rel.from),
        target: String(rel.to),
        label: rel.type,
        style: edgeStyle,
        markerEnd: edgeMarkerEnd,
        animated: edgeAnimated,
        type: 'default', // This might need to be 'smoothstep' or other based on getLayoutedElements
      };
    }), [relationships]);
  
    // Layout calculation using imported getLayoutedElements
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
      if (baseNodes.length === 0) {
        return { nodes: [], edges: [] };
      }
      // getLayoutedElements is now imported
      return getLayoutedElements(baseNodes, baseEdges, 'TB');
    }, [baseNodes, baseEdges]);

  // State for React Flow internal nodes and edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Update React Flow nodes and edges when layout changes
  useEffect(() => {
    const edgesWithIds = layoutedEdges.map(edge => ({
      ...edge,
      id: edge.id || uuidv4() // Ensure all edges have IDs
    }));
    setNodes(layoutedNodes);
    setEdges(edgesWithIds);
  }, [layoutedNodes, layoutedEdges]);

  // Handler for React Flow node changes
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes] // setNodes is stable, so this is fine.
  );

  // Modal Handler Functions
  const handleOpenCreateRelationshipModal = useCallback((params) => {
    setError(''); // Clear previous errors
    setCurrentRelationshipDetails({ from: params.source, to: params.target });
    setModalMode('create');
    setIsRelationshipModalOpen(true);
  }, [setError]);

  const handleOpenEditRelationshipModal = useCallback((edge) => {
    setError(''); // Clear previous errors
    setCurrentRelationshipDetails({ 
      id: edge.id, 
      from: edge.source, 
      to: edge.target, 
      type: edge.label || edge.type 
    });
    setModalMode('edit');
    setIsRelationshipModalOpen(true);
  }, [setError]);

  const handleCloseRelationshipModal = useCallback(() => {
    setIsRelationshipModalOpen(false);
    setCurrentRelationshipDetails(null);
    // setError(''); // Optionally clear error when modal is explicitly closed by user
  }, []);

  const handleRelationshipModalSubmit = useCallback((data) => {
    let success = false;
    if (modalMode === 'create') {
      success = addRelationshipFromModal({ 
        from: data.from, 
        to: data.to, 
        type: data.type 
      });
    } else if (modalMode === 'edit' && currentRelationshipDetails?.id) {
      success = updateRelationship(currentRelationshipDetails.id, data);
    }

    if (success) {
      handleCloseRelationshipModal();
    }
    // If not successful, an error is expected to be set by hook functions.
    // The modal remains open, allowing the user to see the error.
  }, [modalMode, currentRelationshipDetails, addRelationshipFromModal, updateRelationship, handleCloseRelationshipModal]);

  const handleEdgeTransfer = useCallback((oldEdge, newConnection) => {
    console.log(
      `Edge transfer attempt: Edge ID ${oldEdge.id} from ${oldEdge.source}->${oldEdge.target} to ${newConnection.source}->${newConnection.target}`
    );
    // Actual update logic will be added in a subsequent step using a function from useGenogramState.
    // For now, React Flow will visually update the edge, but this change won't persist in our state
    // until the useGenogramState hook's function is called and `relationships` are updated,
    // which will then trigger a re-render with the correct edges.

  // Ensure oldEdge.id, newConnection.source, and newConnection.target are valid
  if (!oldEdge || !oldEdge.id || !newConnection || !newConnection.source || !newConnection.target) {
    console.error("Invalid edge transfer data received.", { oldEdge, newConnection });
    setError("Invalid data for edge transfer."); // Set an error message
    return; 
  }

  const success = updateRelationship(oldEdge.id, { 
    from: newConnection.source, 
    to: newConnection.target 
  });

  if (success) {
    console.log(`Edge ${oldEdge.id} successfully transferred.`);
    // The visual update will occur when relationships state changes,
    // triggering re-layout and re-render of GenogramDisplay.
    setError(''); // Clear any previous errors on success
  } else {
    console.warn(`Failed to transfer edge ${oldEdge.id}. Error should be displayed.`);
    // Error is set by updateRelationship and displayed by App's error display logic.
    // ReactFlow should ideally revert the edge if the update is not confirmed by a change in the `edges` prop.
  }
}, [updateRelationship, setError]); // Added setError to dependency array


  // Function for downloading genogram (PDF/PNG) - kept as per instructions
  const downloadGenogram = (format) => {
    alert(`Downloading genogram as ${format}`);
    // In a real app, this would use a library to generate PDF/PNG
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-blue-700 text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">Family Genogram Builder</h1>
        <p className="text-sm">For Family Medicine Practitioners</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-b-lg shadow">
        {/* Left panel - Input methods */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
          <div className="flex border-b mb-4">
            <button
              className={`py-2 px-4 ${activeTab === 'form' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('form')}
            >
              Form Input
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'json' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('json')}
            >
              JSON Input
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}
          
          {activeTab === 'form' ? (
            <GenogramForm 
              newMember={newMember} 
              setNewMember={setNewMember} 
              handleAddMember={handleAddMember} 
              newRelationship={newRelationship} 
              setNewRelationship={setNewRelationship} 
              handleAddRelationship={handleAddRelationship} 
              familyMembers={familyMembers} 
              error={error} 
              setError={setError} /* Pass setError if GenogramForm needs to clear errors */
            />
          ) : (
            <JsonInput 
              jsonInput={jsonInput} 
              setJsonInput={setJsonInput} 
              handleJsonApply={handleJsonApply} 
              exportData={exportData} 
              setError={setError} 
              setFamilyMembers={setFamilyMembers} 
              setRelationships={setRelationships}
            />
          )}
        </div>
        
        {/* Center panel - Genogram Display */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">Family Genogram</h2>
              <div className="flex space-x-2">
                <button
                  className="flex items-center py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => downloadGenogram('pdf')}
                >
                  <Download size={16} className="mr-1" /> PDF
                </button>
                <button
                  className="flex items-center py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => downloadGenogram('png')}
                >
                  <Download size={16} className="mr-1" /> PNG
                </button>
              </div>
            </div>
            <GenogramDisplay 
              nodes={nodes} 
              edges={edges} 
              nodeTypes={nodeTypes} 
              onNodesChange={onNodesChange}
              onConnect={handleOpenCreateRelationshipModal} // Pass onConnect handler
              onEdgeEdit={handleOpenEditRelationshipModal}  // Pass onEdgeEdit handler
              onEdgeTransfer={handleEdgeTransfer} // Pass onEdgeTransfer handler
            />
          </div>
          
          {/* Data Tables Section */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-2">Family Members</h2>
            <FamilyMembersTable 
              familyMembers={familyMembers} 
              handleDeleteMember={handleDeleteMember} 
            />
            
            {relationships && relationships.length > 0 && (
              <>
                <h2 className="text-lg font-medium mt-4 mb-2">Relationships</h2>
                <RelationshipsTable 
                  relationships={relationships} 
                  familyMembers={familyMembers} 
                  handleDeleteRelationship={handleDeleteRelationship} 
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Relationship Modal */}
      {isRelationshipModalOpen && (
        <RelationshipModal
          isOpen={isRelationshipModalOpen}
          onClose={handleCloseRelationshipModal}
          onSubmit={handleRelationshipModalSubmit}
          relationshipData={modalMode === 'edit' ? currentRelationshipDetails : undefined}
          sourceNodeId={modalMode === 'create' ? currentRelationshipDetails?.from : undefined}
          targetNodeId={modalMode === 'create' ? currentRelationshipDetails?.to : undefined}
          // familyMembers={familyMembers} // Optional: for displaying names
        />
      )}
    </div>
  );
}
