import React from 'react';
import { Plus } from 'lucide-react';

const GenogramForm = (props) => {
  const {
    newMember,
    setNewMember,
    handleAddMember,
    newRelationship,
    setNewRelationship,
    handleAddRelationship,
    familyMembers,
  } = props;

  return (
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
  );
};

export default GenogramForm;
