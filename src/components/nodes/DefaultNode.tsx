import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { baseNodeStyle, handleStyle } from '../../utils/styles.tsx';

// Custom Node for Other/Default
const DefaultNode = ({ data }) => {
  const nodeStyle = baseNodeStyle(data, 'diamond'); // Or 'rectangle' or other default shape
  
  return (
    <div style={nodeStyle}>
      {/* Top handle */}
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, left: '50%' }} />
      
      {/* Left handle */}
      <Handle type="source" position={Position.Left} style={{ ...handleStyle, top: '50%' }} />
      
      <div className="text-xs p-1">
        <div className="font-medium text-gray-900">{data.name}</div>
        <div className="text-gray-600">
          {data.birthYear}{data.deathYear ? `-${data.deathYear}` : ''}
        </div>
        {data.medicalConditions && (
          <div className="mt-1 text-xs text-red-600">{data.medicalConditions}</div>
        )}
      </div>
      
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ ...handleStyle, top: '50%' }} />
      
      {/* Bottom handle */}
      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, left: '50%' }} />
      
      {data.deceased && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-red-500 transform rotate-45 origin-center"></div>
        </div>
      )}
    </div>
  );
};

export default DefaultNode;
