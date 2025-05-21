// Base node styles
export const baseNodeStyle = (data, shape) => ({
    width: 100,
    minHeight: 80,
    backgroundColor: data.deceased ? '#f9fafb' : (data.gender === 'female' ? '#fce4ec' : data.gender === 'male' ? '#e3f2fd' : '#e8f5e9'),
    border: `2px solid ${data.deceased ? '#9ca3af' : '#374151'}`,
    borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '4px', // 'diamond' was not explicitly handled here, defaults to 4px
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)'
    },
    '& .handle': {
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out'
    },
    '&:hover .handle': {
      opacity: 1
    }
  });
  
  // Style for handles on nodes
  export const handleStyle = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: '#4f46e5',
    border: '2px solid white',
    zIndex: 10,
    cursor: 'crosshair',
    boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.3)'
  };
  