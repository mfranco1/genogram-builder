import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  birthYear?: string;
  deceased: boolean;
  deathDate: string;
  medicalConditions: string;
}

interface Relationship {
  id: string;
  from: string;
  to: string;
  type: string;
  sourceHandle?: string;
  targetHandle?: string;
}


export const useGenogramState = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [familyMembers, setFamilyMembers] = useState([] as FamilyMember[]);
  const [relationships, setRelationships] = useState([] as Relationship[]);
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

  const handleAddMember = () => {
    if (!newMember.name) {
      setError('Name is a required field');
      return;
    }
    
    const newMemberWithId: FamilyMember = {
      ...newMember,
      id: uuidv4(),
      gender: newMember.gender as 'male' | 'female' | 'other',
      birthYear: newMember.birthDate ? new Date(newMember.birthDate).getFullYear().toString() : ''
    };
    
    setFamilyMembers([...familyMembers, newMemberWithId]);
    setNewMember({
      id: uuidv4(), 
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
    // In the original App.js, this was by index, but ID is safer if relationships can be reordered.
    // However, the prompt implies moving the function as-is, and App.js uses index.
    // For now, sticking to index. If this causes issues later, it can be revised.
    // A more robust way would be to pass the relationship ID.
    setRelationships(relationships.filter((_, i) => i !== index));
  };
  
  // A version of handleDeleteRelationship using ID, if preferred later:
  // const handleDeleteRelationshipById = (id) => {
  //   setRelationships(relationships.filter(rel => rel.id !== id));
  // };

  const handleJsonApply = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      if (data.members && Array.isArray(data.members)) {
        // Process members to ensure birthYear is set from birthDate if needed
        const processedMembers = data.members.map(member => ({
          ...member,
          ...(member.birthDate && !member.birthYear && {
            birthYear: new Date(member.birthDate).getFullYear()
          })
        }));
        setFamilyMembers(processedMembers);
      } else {
        // If no members array, or it's not an array, initialize to empty
        setFamilyMembers([]);
      }
      
      if (data.relationships && Array.isArray(data.relationships)) {
        // Ensure each relationship has the required fields and default handle values if not present
        const processedRelationships = data.relationships.map(rel => ({
          id: rel.id || uuidv4(),
          from: rel.from,
          to: rel.to,
          type: rel.type || 'parent-child',
          sourceHandle: rel.sourceHandle || 'right',
          targetHandle: rel.targetHandle || 'left'
        }));
        setRelationships(processedRelationships);
      } else {
        // If no relationships array, or it's not an array, initialize to empty
        setRelationships([]);
      }
      
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
      console.error('Error parsing JSON for apply:', err);
    }
  };

  const exportData = () => {
    const data = {
      members: familyMembers.map(({ id, name, gender, birthDate, deceased, deathDate, medicalConditions, birthYear }) => ({
        id,
        name,
        gender,
        birthDate, // Keep original birthDate
        birthYear: birthYear || (birthDate ? new Date(birthDate).getFullYear().toString() : undefined), // Ensure birthYear is present
        deceased,
        deathDate: deceased ? deathDate : undefined,
        medicalConditions: medicalConditions || undefined
      })).filter(Boolean),
      relationships: relationships.map(({ id, from, to, type, sourceHandle, targetHandle }) => ({
        id,
        from,
        to,
        type,
        sourceHandle,
        targetHandle
      })).filter(Boolean)
    };
    
    return JSON.stringify(data, null, 2);
  };

  const addRelationshipFromModal = (relationData: { 
    from: string; 
    to: string; 
    type: string;
    sourceHandle?: string;
    targetHandle?: string;
  }) => {
    try {
      console.log('addRelationshipFromModal called with:', relationData);
      const { from, to, type } = relationData;

      if (!from || !to) {
        const errorMsg = 'Both source and target nodes must be provided for a relationship.';
        console.error(errorMsg);
        setError(errorMsg);
        return false; 
      }


      if (from === to) {
        const errorMsg = 'Cannot create a relationship with the same person.';
        console.error(errorMsg);
        setError(errorMsg);
        return false;
      }

      // Check for existing relationship in both directions
      const relationshipExists = relationships.some(
        rel => (rel.from === from && rel.to === to && rel.type === type) ||
              (rel.from === to && rel.to === from && rel.type === type)
      );

      if (relationshipExists) {
        const errorMsg = 'This relationship already exists.';
        console.error(errorMsg);
        setError(errorMsg);
        return false;
      }

      const newRel: Relationship = {
        id: uuidv4(), 
        from,
        to,
        type,
        sourceHandle: relationData.sourceHandle || 'right', // Default to right handle if not specified
        targetHandle: relationData.targetHandle || 'left',  // Default to left handle if not specified
      };

      console.log('Adding new relationship:', newRel);
      setRelationships(prevRelationships => {
        const updated = [...prevRelationships, newRel];
        console.log('Updated relationships:', updated);
        return updated;
      });
      setError('');
      return true; 
    } catch (error) {
      console.error('Error in addRelationshipFromModal:', error);
      setError('An error occurred while creating the relationship.');
      return false;
    }
  };

  const updateRelationship = (
    relationshipId: string, 
    updatedData: { 
      type?: string; 
      from?: string; 
      to?: string;
      sourceHandle?: string;
      targetHandle?: string;
    }
  ) => {
    if (!relationshipId) {
      setError('Relationship ID is required for an update.');
      return false;
    }
  
    const relationshipsCopy = [...relationships];
    const relationshipIndex = relationshipsCopy.findIndex(rel => rel.id === relationshipId);
  
    if (relationshipIndex === -1) {
      setError('Relationship not found for update.');
      return false;
    }
  
    const currentRelationship = relationshipsCopy[relationshipIndex];
    
    // Determine the values to be used for validation and update
    // If a value is not in updatedData, use the current value
    const newFrom = updatedData.from !== undefined ? updatedData.from : currentRelationship.from;
    const newTo = updatedData.to !== undefined ? updatedData.to : currentRelationship.to;
    const newType = updatedData.type !== undefined ? updatedData.type : currentRelationship.type;
  
    // Validate 'from' and 'to' if they are being updated or are part of current data
    if (newFrom === newTo) {
      setError('Cannot form a relationship with the same person.');
      return false;
    }
  
    // Check for duplicates based on the new combination of from, to, and type
    const duplicateExists = relationshipsCopy.some((rel, index) => {
      if (index === relationshipIndex) return false; // Don't compare with itself
      return rel.from === newFrom && rel.to === newTo && rel.type === newType;
    });
  
    if (duplicateExists) {
      setError('Another relationship with the same members and type already exists.');
      return false;
    }
  
    // Apply updates: Merge current relationship with updatedData fields
    // Only fields present in updatedData will overwrite currentRelationship fields.
    const updatedRel: Relationship = {
      ...currentRelationship,
      ...updatedData, // This will selectively update fields present in updatedData
      // If sourceHandle/targetHandle is not provided in updatedData, keep the existing value
      sourceHandle: updatedData.sourceHandle !== undefined ? updatedData.sourceHandle : currentRelationship.sourceHandle,
      targetHandle: updatedData.targetHandle !== undefined ? updatedData.targetHandle : currentRelationship.targetHandle,
    };
    
    relationshipsCopy[relationshipIndex] = updatedRel;
    setRelationships(relationshipsCopy);
    setError('');
    return true;
  };

  return {
    jsonInput,
    setJsonInput,
    familyMembers,
    setFamilyMembers,
    relationships,
    setRelationships,
    newMember,
    setNewMember,
    newRelationship,
    setNewRelationship,
    error,
    setError,
    handleAddMember,
    handleDeleteMember,
    handleAddRelationship,
    handleDeleteRelationship,
    handleJsonApply,
    exportData,
    addRelationshipFromModal,
    updateRelationship, // Add the new function here
  };
};
