import { useState, useEffect } from 'react';
import { Download, FileJson, FileUp, Trash2, Plus, X } from 'lucide-react';

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

  // Simple genogram rendering function - in a real app this would be more sophisticated
  const renderGenogram = () => {
    // This is a simplified visualization - a real implementation would use a proper
    // hierarchical layout algorithm to position family members correctly
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {familyMembers.length === 0 ? (
          <div className="text-center text-gray-500">
            Add family members to start building your genogram
          </div>
        ) : (
          <svg width="100%" height="400" className="border border-gray-200 rounded">
            {familyMembers.map((member, index) => {
              const x = 100 + (index % 3) * 150;
              const y = 80 + Math.floor(index / 3) * 120;
              
              return (
                <g key={member.id}>
                  {/* Symbol based on gender */}
                  {member.gender === 'male' ? (
                    <rect
                      x={x - 25}
                      y={y - 25}
                      width="50"
                      height="50"
                      fill={member.deceased ? "white" : "#e3f2fd"}
                      stroke="black"
                      strokeWidth="2"
                    />
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r="25"
                      fill={member.deceased ? "white" : "#f8bbd0"}
                      stroke="black"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Deceased marker (X) */}
                  {member.deceased && (
                    <>
                      <line x1={x-20} y1={y-20} x2={x+20} y2={y+20} stroke="black" strokeWidth="2" />
                      <line x1={x+20} y1={y-20} x2={x-20} y2={y+20} stroke="black" strokeWidth="2" />
                    </>
                  )}
                  
                  {/* Text label */}
                  <text
                    x={x}
                    y={y + 50}
                    textAnchor="middle"
                    fontSize="12"
                    fontFamily="sans-serif"
                  >
                    {member.name}
                  </text>
                  
                  {/* Birth/Death years */}
                  <text
                    x={x}
                    y={y + 65}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="sans-serif"
                    fill="gray"
                  >
                    {member.birthYear}{member.deceased && member.deathYear ? `-${member.deathYear}` : ''}
                  </text>
                </g>
              );
            })}
            
            {/* Relationship lines */}
            {relationships.map((rel, index) => {
              const fromMember = familyMembers.findIndex(m => m.id === rel.from);
              const toMember = familyMembers.findIndex(m => m.id === rel.to);
              
              if (fromMember === -1 || toMember === -1) return null;
              
              const fromX = 100 + (fromMember % 3) * 150;
              const fromY = 80 + Math.floor(fromMember / 3) * 120;
              const toX = 100 + (toMember % 3) * 150;
              const toY = 80 + Math.floor(toMember / 3) * 120;
              
              let strokeStyle = "black";
              let strokeWidth = 2;
              let dashArray = "";
              
              if (rel.type === "married") {
                strokeStyle = "black";
                strokeWidth = 3;
              } else if (rel.type === "divorced") {
                strokeStyle = "black";
                strokeWidth = 2;
                dashArray = "5,5";
              } else if (rel.type === "parent-child") {
                strokeStyle = "blue";
              }
              
              return (
                <line
                  key={`rel-${index}`}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={strokeStyle}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                />
              );
            })}
          </svg>
        )}
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