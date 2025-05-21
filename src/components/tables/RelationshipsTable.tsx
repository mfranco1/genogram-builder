import React from 'react';
import { Trash2 } from 'lucide-react';

const RelationshipsTable = ({ relationships, familyMembers, handleDeleteRelationship }) => {
  if (!relationships || relationships.length === 0) {
    // No need to render anything if there are no relationships,
    // or you could return a specific message like:
    // return <p className="text-gray-500 italic mt-4">No relationships defined yet.</p>;
    // For now, returning null to match original behavior where the heading is outside.
    return null; 
  }

  const getMemberNameById = (id) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : id; // Fallback to ID if name not found
  };

  return (
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
          {relationships.map((rel, index) => (
            <tr key={rel.id || index}> {/* Use rel.id if available, otherwise fallback to index */}
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{rel.id}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{getMemberNameById(rel.from)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{getMemberNameById(rel.to)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{rel.type}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteRelationship(index)} // Original App.js used index
                  title={`Delete relationship between ${getMemberNameById(rel.from)} and ${getMemberNameById(rel.to)}`}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RelationshipsTable;
