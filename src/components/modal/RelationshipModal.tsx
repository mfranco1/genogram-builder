import React, { useState, useEffect } from 'react';

interface FamilyMember {
  id: string;
  name: string;
  gender?: string;
  birthYear?: string;
  birthDate?: string;
  deceased?: boolean;
  deathYear?: string;
  deathDate?: string;
  medicalConditions?: string[];
}

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; from: string; to: string }) => void;
  relationshipData?: { id?: string; type: string; from: string; to: string };
  sourceNodeId?: string; // For new relationships
  targetNodeId?: string; // For new relationships
  familyMembers: FamilyMember[]; // For displaying names
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  relationshipData,
  sourceNodeId,
  targetNodeId,
  familyMembers
}) => {
  const [type, setType] = useState('parent-child'); // Default type

  useEffect(() => {
    if (isOpen) {
      if (relationshipData) {
        setType(relationshipData.type);
      } else {
        // Reset to default for new relationships
        setType('parent-child');
      }
    }
  }, [isOpen, relationshipData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const fromId = relationshipData?.from || sourceNodeId;
    const toId = relationshipData?.to || targetNodeId;
    if (fromId && toId) {
      onSubmit({ type, from: fromId, to: toId });
    } else {
      console.error("Source or target ID is missing");
      // Optionally, show an error to the user in the modal
    }
  };
  
  // const getMemberName = (id) => familyMembers.find(m => m.id === id)?.name || id;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {relationshipData ? 'Edit Relationship' : 'Create Relationship'}
        </h2>
        
        <div className="mb-4">
          <p><span className="font-semibold">From:</span> {familyMembers.find(m => m.id === (relationshipData?.from || sourceNodeId))?.name || relationshipData?.from || sourceNodeId || 'N/A'}</p>
          <p><span className="font-semibold">To:</span> {familyMembers.find(m => m.id === (relationshipData?.to || targetNodeId))?.name || relationshipData?.to || targetNodeId || 'N/A'}</p>
        </div>

        <div className="mb-4">
          <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
            Relationship Type
          </label>
          <select
            id="relationshipType"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="parent-child">Parent-Child</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="siblings">Siblings</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipModal;
