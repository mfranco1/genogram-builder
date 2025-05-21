import React from 'react';
import { FileUp, Download, FileJson } from 'lucide-react';

const JsonInput = (props) => {
  const {
    jsonInput,
    setJsonInput,
    handleJsonApply,
    exportData,
    setError,
    setFamilyMembers,
    setRelationships
  } = props;

  const handleFileUpload = (e) => {
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
            ...(member.birthDate && !member.birthYear && {
              birthYear: new Date(member.birthDate).getFullYear()
            })
          }));
          
          setFamilyMembers(processedMembers);
          // Update jsonInput prop to reflect the processed data (if needed, or keep original uploaded content)
          // For consistency, let's reflect the possibly processed data.
          setJsonInput(JSON.stringify({ ...data, members: processedMembers }, null, 2));
        } else {
          setFamilyMembers([]); // Or handle as an error: "Missing members array"
        }

        if (data.relationships && Array.isArray(data.relationships)) {
          setRelationships(data.relationships);
        } else {
          setRelationships([]); // Or handle as an error: "Missing relationships array"
        }
        setError(''); // Clear previous errors
      } catch (err) {
        setError('Invalid JSON file');
        console.error('Error parsing JSON from file:', err);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
    // Reset the input to allow selecting the same file again
    e.target.value = '';
  };

  const handleDownload = () => {
    const data = exportData(); // This function should be provided by the parent via props
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'genogram.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadCurrentData = () => {
    setJsonInput(exportData()); // exportData should return the current state as a JSON string
  };

  return (
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
                onChange={handleFileUpload}
              />
            </label>
            <button
              onClick={handleDownload}
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
          onClick={handleLoadCurrentData}
        >
          <FileJson size={16} className="mr-1" /> Load Current Data
        </button>
        <button
          className="flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          onClick={handleJsonApply} // This prop is directly used
        >
          <FileUp size={16} className="mr-1" /> Apply JSON
        </button>
      </div>
    </div>
  );
};

export default JsonInput;
