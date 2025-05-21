import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useGenogramState = () => {
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

  const handleAddMember = () => {
    if (!newMember.name) {
      setError('Name is a required field');
      return;
    }
    
    const newMemberWithId = {
      ...newMember,
      id: uuidv4(),
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
        setRelationships(data.relationships);
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
      relationships: relationships.map(({ id, from, to, type }) => ({
        id,
        from,
        to,
        type
      })).filter(Boolean)
    };
    
    return JSON.stringify(data, null, 2);
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
  };
};
