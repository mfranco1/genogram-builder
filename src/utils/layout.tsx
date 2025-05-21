import dagre from '@dagrejs/dagre';
import { Position, MarkerType } from '@xyflow/react';

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 100,
    ranksep: 120,
    ranker: 'tight-tree',
    align: 'UL',
    acyclicer: 'greedy',
    // ranker: 'network-simplex' // Original App.js had this duplicated, removed one.
                                  // Keeping network-simplex as it's often good for complex graphs.
                                  // If 'tight-tree' was intended, this can be changed.
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: 120, 
      height: 100 
    });
  });

  edges.forEach((edge) => {
    const isParentChild = edge.type === 'parent' || edge.type === 'child';
    dagreGraph.setEdge(edge.source, edge.target, { 
      weight: isParentChild ? 2 : 1,
      minlen: isParentChild ? 2 : 1,
      relationship: edge.type
    });
  });

  dagre.layout(dagreGraph);

  // The getEdgeParams function was originally defined inside getLayoutedElements in App.js
  // It needs access to 'nodes' (the first argument to getLayoutedElements)
  // So it's kept as an inner function or passed 'nodes' if refactored out.
  // For this step, keeping it as an inner function.
  const getEdgeParams = (sourceId, targetId, allNodes) => {
    const sourceNode = allNodes.find(n => n.id === sourceId);
    const targetNode = allNodes.find(n => n.id === targetId);
    
    const sourceX = sourceNode?.position?.x || 0;
    const sourceY = sourceNode?.position?.y || 0;
    const targetX = targetNode?.position?.x || 0;
    const targetY = targetNode?.position?.y || 0;
    
    const isHorizontal = Math.abs(sourceY - targetY) < 50; 
    
    // Default style for edges, can be overridden by specific types below
    let style = {
        stroke: isHorizontal ? '#4f46e5' : '#10b981', // Default horizontal/vertical colors
        strokeWidth: 2,
        strokeDasharray: '0', // Default solid line
    };
    let marker = { // Default marker
        type: MarkerType.ArrowClosed,
        color: isHorizontal ? '#4f46e5' : '#10b981',
        width: 20,
        height: 20
    };

    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      style: style, // Apply the determined style
      markerEnd: marker, // Apply the determined marker
    };
  };

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 60, 
        y: nodeWithPosition.y - 50,
      },
      data: {
        ...node.data,
      }
    };
  });

  const layoutedEdges = edges.map((edge) => {
    // Pass 'nodes' (the original nodes array) to getEdgeParams
    const { sourcePosition, targetPosition } = getEdgeParams(edge.source, edge.target, nodes); 
    
    const isParentChild = edge.type === 'parent' || edge.type === 'child';
    const isMarried = edge.type === 'married';
    const isDivorced = edge.type === 'divorced';
    const isSiblings = edge.type === 'siblings';
    
    const edgeStyle = {
      stroke: isParentChild ? '#10b981' : 
             isMarried ? '#4f46e5' :
             isDivorced ? '#ef4444' :
             isSiblings ? '#8b5cf6' : '#9ca3af',
      strokeWidth: 2,
      strokeDasharray: isDivorced ? '5,3' : '0',
    };

    const markerEnd = isParentChild ? {
      type: MarkerType.ArrowClosed,
      color: '#10b981', // Specific color for parent-child arrow
      width: 15,
      height: 15
    } : undefined; // No arrow for other types

    return {
      ...edge,
      type: 'smoothstep', // Using smoothstep for better edge routing
      sourcePosition: sourcePosition, // Use determined sourcePosition
      targetPosition: targetPosition, // Use determined targetPosition
      style: edgeStyle,
      markerEnd,
      animated: true // Kept animated as true from original
    };
  });

  return { 
    nodes: layoutedNodes, 
    edges: layoutedEdges
  };
};
