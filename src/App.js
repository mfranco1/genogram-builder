import { useState, useEffect, useMemo } from 'react';
import { Download, FileJson, FileUp, Trash2, Plus, X } from 'lucide-react';
import { ReactFlow as XYFlow, ReactFlowProvider, Background, Controls, Handle, Position, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

const NODE_WIDTH = 150; 
const NODE_HEIGHT = 100; 

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 70 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

// Custom Node for Male
const MaleNode = ({ data }) => {
  const nodeStyle = {
    width: 50,
    height: 50,
    backgroundColor: data.deceased ? 'white' : '#e3f2fd',
    border: '2px solid black',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };
  const textStyle = { fontSize: '10px', marginTop: '5px' };
  const deceasedStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      {data.deceased && (
        <svg style={deceasedStyle} width="100%" height="100%" viewBox="0 0 50 50">
          <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
          <line x1="40" y1="10" x2="10" y2="40" stroke="black" strokeWidth="2" />
        </svg>
      )}
      <div style={{ position: 'absolute', bottom: '-40px', width: '100px' }}>
        <div style={textStyle}>{data.name}</div>
        <div style={{ ...textStyle, fontSize: '8px', color: 'gray' }}>
          {data.birthYear}{data.deceased && data.deathYear ? `-${data.deathYear}` : ''}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Custom Node for Female
const FemaleNode = ({ data }) => {
  const nodeStyle = {
    width: 50,
    height: 50,
    backgroundColor: data.deceased ? 'white' : '#f8bbd0',
    border: '2px solid black',
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };
  const textStyle = { fontSize: '10px', marginTop: '5px' };
   const deceasedStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      {data.deceased && (
         <svg style={deceasedStyle} width="100%" height="100%" viewBox="0 0 50 50">
          <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
          <line x1="40" y1="10" x2="10" y2="40" stroke="black" strokeWidth="2" />
        </svg>
      )}
      <div style={{ position: 'absolute', bottom: '-40px', width: '100px' }}>
        <div style={textStyle}>{data.name}</div>
        <div style={{ ...textStyle, fontSize: '8px', color: 'gray' }}>
          {data.birthYear}{data.deceased && data.deathYear ? `-${data.deathYear}` : ''}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Custom Node for Other/Default
const DefaultNode = ({ data }) => {
  const nodeStyle = {
    width: 50,
    height: 50,
    backgroundColor: data.deceased ? 'white' : '#eeeeee',
    border: '2px solid black',
    borderRadius: '10px', // Rounded rectangle
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };
  const textStyle = { fontSize: '10px', marginTop: '5px' };
  const deceasedStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      {data.deceased && (
        <svg style={deceasedStyle} width="100%" height="100%" viewBox="0 0 50 50">
          <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
          <line x1="40" y1="10" x2="10" y2="40" stroke="black" strokeWidth="2" />
        </svg>
      )}
      <div style={{ position: 'absolute', bottom: '-40px', width: '100px' }}>
        <div style={textStyle}>{data.name}</div>
        <div style={{ ...textStyle, fontSize: '8px', color: 'gray' }}>
          {data.birthYear}{data.deceased && data.deathYear ? `-${data.deathYear}` : ''}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default function GenogramApp() {
  const [activeTab, setActiveTab] = useState('form');
  const [jsonInput, setJsonInput] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [newMember, setNewMember] = useState({
    id: '',
    name: '',
    gender: 'male',
    birthYear: '',
    deceased: false,
    deathYear: '',
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
      birthYear: member.birthYear, 
      deceased: member.deceased, 
      deathYear: member.deathYear, 
      medicalConditions: member.medicalConditions 
    },
    type: member.gender === 'male' ? 'maleNode' : member.gender === 'female' ? 'femaleNode' : 'defaultNode',
    position: { x: 0, y: 0 } // Initial position, will be overwritten by Dagre
  })), [familyMembers]);

  // Base edges derived from relationships
  const baseEdges = useMemo(() => relationships.map((rel, index) => {
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
      id: `e-${rel.from}-${rel.to}-${rel.type || ''}-${index}`,
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
    if (!newMember.id || !newMember.name) {
      setError('ID and Name are required fields');
      return;
    }
    
    if (familyMembers.some(member => member.id === newMember.id)) {
      setError('ID must be unique');
      return;
    }
    
    setFamilyMembers([...familyMembers, newMember]);
    setNewMember({
      id: '',
      name: '',
      gender: 'male',
      birthYear: '',
      deceased: false,
      deathYear: '',
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
    
    setRelationships([...relationships, newRelationship]);
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
    const data = {
      members: familyMembers,
      relationships: relationships
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
  const renderGenogram = () => {
    if (layoutedNodes.length === 0) {
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
            nodes={layoutedNodes}
            edges={layoutedEdges}
            nodeTypes={nodeTypes}
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
        <h1 className="text-2xl font-bold">Family Genogram Generator</h1>
        <p className="text-sm">For family medicine practitioners</p>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newMember.id}
                      onChange={(e) => setNewMember({...newMember, id: e.target.value})}
                      placeholder="e.g. father1"
                    />
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700">Birth Year</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={newMember.birthYear}
                      onChange={(e) => setNewMember({...newMember, birthYear: e.target.value})}
                      placeholder="1980"
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
                      <label className="block text-sm text-gray-700">Death Year</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={newMember.deathYear}
                        onChange={(e) => setNewMember({...newMember, deathYear: e.target.value})}
                        placeholder="2020"
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
              <h2 className="text-lg font-medium mb-2">JSON Input</h2>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows="12"
                placeholder={`{
  "members": [
    {
      "id": "father",
      "name": "John Doe",
      "gender": "male",
      "birthYear": "1950"
    },
    {
      "id": "mother",
      "name": "Jane Doe",
      "gender": "female",
      "birthYear": "1952"
    }
  ],
  "relationships": [
    {
      "from": "father",
      "to": "mother",
      "type": "married"
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
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {fromMember ? fromMember.name : rel.from}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {toMember ? toMember.name : rel.to}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {rel.type}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteRelationship(index)}
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