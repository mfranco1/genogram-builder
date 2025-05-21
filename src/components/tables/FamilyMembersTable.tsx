import React from 'react';
import { Trash2 } from 'lucide-react';

const FamilyMembersTable = ({ familyMembers, handleDeleteMember }) => {
  if (!familyMembers || familyMembers.length === 0) {
    return <p className="text-gray-500 italic">No family members added yet.</p>;
  }

  return (
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
                {member.deceased ? `Deceased (${member.deathYear || 'N/A'})` : 'Living'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteMember(member.id)}
                  title={`Delete ${member.name}`}
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

export default FamilyMembersTable;
