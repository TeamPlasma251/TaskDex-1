// Type-based color utilities
export const getTypeHoverColor = (type) => {
  const colors = {
    'Grass': 'hover:bg-green-600 hover:ring-green-500',
    'Fire': 'hover:bg-red-600 hover:ring-red-500',
    'Water': 'hover:bg-blue-600 hover:ring-blue-500',
    'Psychic': 'hover:bg-pink-300 hover:ring-pink-400', // Baby pink
    'Ghost': 'hover:bg-blue-900 hover:ring-blue-800', // Navy blue
    'Electric': 'hover:bg-yellow-500 hover:ring-yellow-400',
  };
  return colors[type] || 'hover:bg-gray-600 hover:ring-gray-500';
};

export const getTypeRingColor = (type) => {
  const colors = {
    'Grass': 'ring-green-400',
    'Fire': 'ring-red-400',
    'Water': 'ring-blue-400',
    'Psychic': 'ring-pink-400',
    'Ghost': 'ring-blue-800',
    'Electric': 'ring-yellow-400',
  };
  return colors[type] || 'ring-gray-400';
};

