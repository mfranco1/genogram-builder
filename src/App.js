import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, FileJson, FileUp, Trash2, Plus, X } from 'lucide-react';
import { ReactFlow as XYFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType, applyNodeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { v4 as uuidv4 } from 'uuid';

const NODE_WIDTH = 150; 
const NODE_HEIGHT = 100; 

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Use different spacing for different relationship types
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 100,  // Increased horizontal spacing
    ranksep: 120,  // Increased vertical spacing
    ranker: 'tight-tree',
    align: 'UL',
    acyclicer: 'greedy',
    ranker: 'network-simplex'
  });

  // Set nodes with their dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: 120,  // Slightly larger to accommodate new styling
      height: 100 
    });
  });

  // Add edges with weights based on relationship type
  edges.forEach((edge) => {
    const isParentChild = edge.type === 'parent' || edge.type === 'child';
    const isMarried = edge.type === 'married';
    const isDivorced = edge.type === 'divorced';
    const isSiblings = edge.type === 'siblings';
    
    dagreGraph.setEdge(edge.source, edge.target, { 
      weight: isParentChild ? 2 : 1,
      minlen: isParentChild ? 2 : 1,
      // Add relationship type as edge data
      relationship: edge.type
    });
  });

  // Run the layout
  dagre.layout(dagreGraph);

  // Position nodes
  const getEdgeParams = (source, target) => {
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
    
    // Default to center of nodes
    const sourceX = sourceNode?.position?.x || 0;
    const sourceY = sourceNode?.position?.y || 0;
    const targetX = targetNode?.position?.x || 0;
    const targetY = targetNode?.position?.y || 0;
    
    // Determine if this is a horizontal (sibling/marriage) or vertical (parent-child) relationship
    const isHorizontal = Math.abs(sourceY - targetY) < 50; // Nodes are roughly at the same Y level
    
    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      style: {
        stroke: isHorizontal ? '#4f46e5' : '#10b981',
        strokeWidth: 2,
        strokeDasharray: isHorizontal ? '0' : '5,5'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isHorizontal ? '#4f46e5' : '#10b981',
        width: 20,
        height: 20
      }
    };
  };

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 60,  // Center the node
        y: nodeWithPosition.y - 50,
      },
      data: {
        ...node.data,
        // Add any additional node data here
      }
    };
  });

  const layoutedEdges = edges.map((edge) => {
    const { sourceX, sourceY, targetX, targetY } = getEdgeParams(edge.source, edge.target);
    const isParentChild = edge.type === 'parent' || edge.type === 'child';
    const isMarried = edge.type === 'married';
    const isDivorced = edge.type === 'divorced';
    const isSiblings = edge.type === 'siblings';
    
    // Determine edge style based on relationship type
    const edgeStyle = {
      stroke: isParentChild ? '#10b981' : 
             isMarried ? '#4f46e5' :
             isDivorced ? '#ef4444' :
             isSiblings ? '#8b5cf6' : '#9ca3af',
      strokeWidth: 2,
      strokeDasharray: isDivorced ? '5,3' : '0',
    };

    // Only add arrow for parent-child relationships
    const markerEnd = isParentChild ? {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
      width: 15,
      height: 15
    } : undefined;

    return {
      ...edge,
      type: 'smoothstep',
      sourcePosition: isParentChild ? Position.Bottom : Position.Right,
      targetPosition: isParentChild ? Position.Top : Position.Left,
      style: edgeStyle,
      markerEnd,
      animated: true
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges: layoutedEdges
  };
};

// Base node styles
const baseNodeStyle = (data, shape) => ({
  width: 100,
  minHeight: 80,
  backgroundColor: data.deceased ? '#f9fafb' : (data.gender === 'female' ? '#fce4ec' : data.gender === 'male' ? '#e3f2fd' : '#e8f5e9'),
  border: `2px solid ${data.deceased ? '#9ca3af' : '#374151'}`,
  borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '4px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  },
  '& .handle': {
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out'
  },
  '&:hover .handle': {
    opacity: 1
  }
});

const handleStyle = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#4f46e5',
  border: '2px solid white',
  zIndex: 10,
  cursor: 'crosshair',
  boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.3)'
};

// Custom Node for Male
const MaleNode = ({ data }) => {
  const nodeStyle = baseNodeStyle(data, 'square');
  
  return (
    <div style={nodeStyle}>
      {/* Top handle */}
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, left: '50%' }} />
      
      {/* Left handle */}
      <Handle type="source" position={Position.Left} style={{ ...handleStyle, top: '50%' }} />
      
      <div className="text-xs p-1">
        <div className="font-medium text-gray-900">{data.name}</div>
        <div className="text-gray-600">
          {data.birthYear}{data.deathYear ? `-${data.deathYear}` : ''}
        </div>
        {data.medicalConditions && (
          <div className="mt-1 text-xs text-red-600">{data.medicalConditions}</div>
        )}
      </div>
      
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ ...handleStyle, top: '50%' }} />
      
      {/* Bottom handle */}
      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, left: '50%' }} />
      
      {data.deceased && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 transform rotate-45 origin-center"></div>
        </div>
      )}
    </div>
  );
};

// Custom Node for Female
const FemaleNode = ({ data }) => {
  const nodeStyle = baseNodeStyle(data, 'circle');
  
  return (
    <div style={nodeStyle}>
      {/* Top handle */}
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, left: '50%' }} />
      
      {/* Left handle */}
      <Handle type="source" position={Position.Left} style={{ ...handleStyle, top: '50%' }} />
      
      <div className="text-xs p-1">
        <div className="font-medium text-gray-900">{data.name}</div>
        <div className="text-gray-600">
          {data.birthYear}{data.deathYear ? `-${data.deathYear}` : ''}
        </div>
        {data.medicalConditions && (
          <div className="mt-1 text-xs text-red-600">{data.medicalConditions}</div>
        )}
      </div>
      
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ ...handleStyle, top: '50%' }} />
      
      {/* Bottom handle */}
      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, left: '50%' }} />
      
      {data.deceased && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 transform rotate-45 origin-center"></div>
        </div>
      )}
    </div>
  );
};

// Custom Node for Other/Default
const DefaultNode = ({ data }) => {
  const nodeStyle = baseNodeStyle(data, 'diamond');
  
  return (
    <div style={nodeStyle}>
      {/* Top handle */}
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, left: '50%' }} />
      
      {/* Left handle */}
      <Handle type="source" position={Position.Left} style={{ ...handleStyle, top: '50%' }} />
      
      <div className="text-xs p-1">
        <div className="font-medium text-gray-900">{data.name}</div>
        <div className="text-gray-600">
          {data.birthYear}{data.deathYear ? `-${data.deathYear}` : ''}
        </div>
        {data.medicalConditions && (
          <div className="mt-1 text-xs text-red-600">{data.medicalConditions}</div>
        )}
      </div>
      
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ ...handleStyle, top: '50%' }} />
      
      {/* Bottom handle */}
      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, left: '50%' }} />
      
      {data.deceased && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 transform rotate-45 origin-center"></div>
        </div>
      )}
    </div>
  );
};

export default function GenogramApp() {
  const [activeTab, setActiveTab] = useState('form');
  const [jsonInput, setJsonInput] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [newMember, setNewMember] = useState({
    id: uuidv4(),
    name: '',
    gender: 'male',
    birthDate: '',
    deceased: false,
    deathDate: '',
    medicalConditions: '',
  });
  const [newRelationship, setNewRelationship] = useState({
    from: '',
    to: '',
    type: 'parent-child',
  });
  const [error, setError] = useState('');

  // Base nodes derived from familyMembers
  const baseNodes = useMemo(() => familyMembers.map((member) => ({
    id: String(member.id),
    data: { 
      name: member.name, 
      gender: member.gender, 
      birthYear: member.birthDate ? new Date(member.birthDate).getFullYear() : member.birthYear, 
      deceased: member.deceased, 
      deathYear: member.deathDate ? new Date(member.deathDate).getFullYear() : member.deathYear, 
      medicalConditions: member.medicalConditions 
    },
    type: member.gender === 'male' ? 'maleNode' : member.gender === 'female' ? 'femaleNode' : 'defaultNode',
    position: { x: 0, y: 0 } // Initial position, will be overwritten by Dagre
  })), [familyMembers]);

  // Base edges derived from relationships
  const baseEdges = useMemo(() => relationships.map((rel) => {
    const edgeStyle = {};
    let edgeMarkerEnd;
    let edgeAnimated = false;

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
        edgeStyle.strokeWidth = 1; // Or 2
        edgeMarkerEnd = { type: MarkerType.ArrowClosed, color: 'blue' };
        edgeAnimated = true; // Keep if desired
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
      id: rel.id || uuidv4(),
      source: String(rel.from),
      target: String(rel.to),
      label: rel.type,
      style: edgeStyle,
      markerEnd: edgeMarkerEnd,
      animated: edgeAnimated,
      type: 'default',
    };
  }), [relationships]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (baseNodes.length === 0) {
      return { nodes: [], edges: [] };
    }
    return getLayoutedElements(baseNodes, baseEdges, 'TB');
  }, [baseNodes, baseEdges]);

  const handleAddMember = () => {
    if (!newMember.name) {
      setError('Name is a required field');
      return;
    }
    
    // Generate a new ID for the next member
    const newMemberWithId = {
      ...newMember,
      id: uuidv4(),
      // Extract year from birthDate for backward compatibility
      birthYear: newMember.birthDate ? new Date(newMember.birthDate).getFullYear().toString() : ''
    };
    
    setFamilyMembers([...familyMembers, newMemberWithId]);
    setNewMember({
      id: uuidv4(), // Pre-generate ID for the next member
      name: '',
      gender: 'male',
      birthDate: '',
      deceased: false,
      deathDate: '',
      medicalConditions: '',
    });
    setError('');
  };

  const handleDeleteMember = (id) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
    setRelationships(relationships.filter(rel => rel.from !== id && rel.to !== id));
  };

  const handleAddRelationship = () => {
    if (!newRelationship.from || !newRelationship.to) {
      setError('Both members must be selected for a relationship');
      return;
    }
    
    if (newRelationship.from === newRelationship.to) {
      setError('Cannot create a relationship with the same person');
      return;
    }
    
    const relationshipExists = relationships.some(
      rel => rel.from === newRelationship.from && rel.to === newRelationship.to && rel.type === newRelationship.type
    );
    
    if (relationshipExists) {
      setError('This relationship already exists');
      return;
    }
    
    // Add relationship with auto-generated ID
    setRelationships([...relationships, {
      ...newRelationship,
      id: uuidv4()
    }]);
    
    setNewRelationship({
      from: '',
      to: '',
      type: 'parent-child',
    });
    setError('');
  };

  const handleDeleteRelationship = (index) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleJsonApply = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      if (data.members && Array.isArray(data.members)) {
        setFamilyMembers(data.members);
      }
      
      if (data.relationships && Array.isArray(data.relationships)) {
        setRelationships(data.relationships);
      }
      
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const exportData = () => {
    // Prepare the data for export, ensuring we include all necessary fields
    const data = {
      members: familyMembers.map(({ id, name, gender, birthDate, deceased, deathDate, medicalConditions }) => ({
        id,
        name,
        gender,
        birthDate,
        deceased,
        deathDate: deceased ? deathDate : undefined,
        medicalConditions: medicalConditions || undefined
      })).filter(Boolean),
      relationships: relationships.map(({ id, from, to, type }) => ({
        id,
        from,
        to,
        type
      })).filter(Boolean)
    };
    
    return JSON.stringify(data, null, 2);
  };

  const downloadGenogram = (format) => {
    // In a real app, this would generate and download the actual file
    // For now, we'll just demonstrate the UI functionality
    alert(`Downloading genogram as ${format}`);
  };

  const nodeTypes = {
    maleNode: MaleNode,
    femaleNode: FemaleNode,
    defaultNode: DefaultNode,
  };

  // Simple genogram rendering function 
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Update nodes and edges when layout changes
  useEffect(() => {
    // Ensure all edges have IDs
    const edgesWithIds = layoutedEdges.map(edge => ({
      ...edge,
      id: edge.id || uuidv4()
    }));
    
    setNodes(layoutedNodes);
    setEdges(edgesWithIds);
  }, [layoutedNodes, layoutedEdges]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) =>
        applyNodeChanges(changes, nds)
      );
    },
    []
  );

  const renderGenogram = () => {
    if (nodes.length === 0) {
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
            <div>
              <h2 className="text-lg font-medium mb-2">Add Family Member</h2>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newMember.gender}
                      onChange={(e) => setNewMember({...newMember, gender: e.target.value})}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newMember.birthDate || ''}
                      onChange={(e) => setNewMember({...newMember, birthDate: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={newMember.deceased}
                    onChange={(e) => setNewMember({...newMember, deceased: e.target.checked})}
                  />
                  <label className="ml-2 block text-sm text-gray-700">Deceased</label>
                  
                  {newMember.deceased && (
                    <div className="ml-4">
                      <label className="block text-sm text-gray-700">Death Date</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={newMember.deathDate || ''}
                        onChange={(e) => setNewMember({...newMember, deathDate: e.target.value})}
                        min={newMember.birthDate || ''}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                  <textarea
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newMember.medicalConditions}
                    onChange={(e) => setNewMember({...newMember, medicalConditions: e.target.value})}
                    placeholder="Diabetes, Hypertension, etc."
                    rows="2"
                  />
                </div>
                
                <button
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddMember}
                >
                  <Plus size={16} className="mr-1" /> Add Member
                </button>
              </div>
              
              <h2 className="text-lg font-medium mb-2">Add Relationship</h2>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Member</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newRelationship.from}
                      onChange={(e) => setNewRelationship({...newRelationship, from: e.target.value})}
                    >
                      <option value="">Select member</option>
                      {familyMembers.map(member => (
                        <option key={`from-${member.id}`} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Member</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newRelationship.to}
                      onChange={(e) => setNewRelationship({...newRelationship, to: e.target.value})}
                    >
                      <option value="">Select member</option>
                      {familyMembers.map(member => (
                        <option key={`to-${member.id}`} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship Type</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={newRelationship.type}
                    onChange={(e) => setNewRelationship({...newRelationship, type: e.target.value})}
                  >
                    <option value="parent-child">Parent-Child</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="siblings">Siblings</option>
                  </select>
                </div>
                
                <button
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddRelationship}
                >
                  <Plus size={16} className="mr-1" /> Add Relationship
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">JSON Input</h2>
                  <div className="flex space-x-2">
                    <label
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <FileUp size={14} className="mr-1" /> Upload
                      <input
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const data = JSON.parse(event.target.result);
                              if (data.members && Array.isArray(data.members)) {
                                // Process members to ensure birthYear is set from birthDate if needed
                                const processedMembers = data.members.map(member => ({
                                  ...member,
                                  // If birthDate exists but birthYear is missing, parse year from birthDate
                                  ...(member.birthDate && !member.birthYear && {
                                    birthYear: new Date(member.birthDate).getFullYear()
                                  })
                                }));
                                
                                setFamilyMembers(processedMembers);
                                setJsonInput(JSON.stringify({
                                  ...data,
                                  members: processedMembers
                                }, null, 2));
                              }
                              if (data.relationships && Array.isArray(data.relationships)) {
                                setRelationships(data.relationships);
                              }
                            } catch (err) {
                              setError('Invalid JSON file');
                              console.error('Error parsing JSON:', err);
                            }
                          };
                          reader.onerror = () => {
                            setError('Error reading file');
                          };
                          reader.readAsText(file);
                          // Reset the input to allow selecting the same file again
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        const data = exportData();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'genogram.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Download JSON"
                    >
                      <Download size={14} className="mr-1" /> Download
                    </button>
                  </div>
                </div>
              </div>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows="12"
                placeholder={`{
  "members": [
    {
      "id": "0a50b51f-5fd0",
      "name": "John Doe",
      "gender": "male",
      "birthDate": "1950-01-01"
    },
    {
      "id": "1b21f31f-7kd1",
      "name": "Jane Doe",
      "gender": "female",
      "birthDate": "1952-01-01"
    }
  ],
  "relationships": [
    {
      "id": "9h00q41p-4md0",
      "from": "John Doe",
      "to": "Jane Doe",
      "type": "Married"
    }
  ]
}`}
              />
              <div className="mt-3 flex justify-between">
                <button
                  className="flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {
                    setJsonInput(exportData());
                  }}
                >
                  <FileJson size={16} className="mr-1" /> Load Current Data
                </button>
                <button
                  className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleJsonApply}
                >
                  <FileUp size={16} className="mr-1" /> Apply JSON
                </button>
              </div>
            </div>
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
            {renderGenogram()}
          </div>
          
          {/* Family member list */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-2">Family Members</h2>
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 italic">No family members added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Year</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {familyMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{member.gender}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{member.birthYear}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {member.deceased ? `Deceased (${member.deathYear})` : 'Living'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {relationships.length > 0 && (
              <>
                <h2 className="text-lg font-medium mt-4 mb-2">Relationships</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {relationships.map((rel, index) => {
                        const fromMember = familyMembers.find(m => m.id === rel.from);
                        const toMember = familyMembers.find(m => m.id === rel.to);
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rel.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{fromMember ? fromMember.name : rel.from}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{toMember ? toMember.name : rel.to}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{rel.type}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteRelationship(index)}
                                title="Delete relationship"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}