import React, { useState, useEffect } from 'react';
import { X, User, Link2 } from 'lucide-react';

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
  sourceNodeId?: string;
  targetNodeId?: string;
  familyMembers: FamilyMember[];
}

const relationshipTypes = [
  { value: 'parent-child', label: 'Parent-Child' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'siblings', label: 'Siblings' },
];

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  relationshipData,
  sourceNodeId,
  targetNodeId,
  familyMembers
}) => {
  const [type, setType] = useState('parent-child');

  useEffect(() => {
    if (isOpen) {
      if (relationshipData) {
        setType(relationshipData.type);
      } else {
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
    }
  };

  const getMemberName = (id: string) => {
    return familyMembers.find(m => m.id === id)?.name || 'Unknown Member';
  };

  const fromId = relationshipData?.from || sourceNodeId || '';
  const toId = relationshipData?.to || targetNodeId || '';
  const fromName = fromId ? getMemberName(fromId) : 'N/A';
  const toName = toId ? getMemberName(toId) : 'N/A';

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 overflow-y-auto h-full w-full flex justify-center items-start pt-16">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-200 ease-in-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Link2 className="w-5 h-5 mr-2 text-indigo-600" />
            {relationshipData ? 'Edit Relationship' : 'Create New Relationship'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Connection Preview */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <User className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <p className="font-medium text-gray-800 truncate">{fromName}</p>
                  <p className="text-xs text-gray-500 mt-1">Source</p>
                </div>
              </div>
              
              <div className="px-4 flex flex-col items-center">
                <div className="h-0.5 w-8 bg-indigo-300 my-2"></div>
                <span className="text-xs text-indigo-500 font-medium">
                  {relationshipTypes.find(rt => rt.value === type)?.label}
                </span>
                <div className="h-0.5 w-8 bg-indigo-300 my-2"></div>
              </div>
              
              <div className="flex-1 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <User className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                  <p className="font-medium text-gray-800 truncate">{toName}</p>
                  <p className="text-xs text-gray-500 mt-1">Target</p>
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Type Selector */}
          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              id="relationshipType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-colors duration-150"
            >
              {relationshipTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
          >
            {relationshipData ? 'Update' : 'Create'} Relationship
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipModal;
