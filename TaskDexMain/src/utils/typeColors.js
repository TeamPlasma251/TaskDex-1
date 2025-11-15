// Type-based color utilities

// Utility: fallback to inline style if Tailwind doesn't have a close match
const typeHexColors = {
  Bug: '#A8B820',
  Dark: '#705848',
  Dragon: '#7038F8',
  Electric: '#F8D030',
  Fighting: '#C03028',
  Fire: '#F08030',
  Ghost: '#705898',
  Grass: '#78C850',
  Ground: '#E0C068',
  Ice: '#98D8D8',
  Normal: '#A8A878',
  Poison: '#A040A0',
  Psychic: '#F85888',
  Rock: '#B8A038',
  Steel: '#B8B8D0',
  Water: '#6890F0',
};

export const getTypeHoverColor = (type) => {
  // Use Tailwind if possible, else fallback to inline style
  const tw = {
    Grass: 'hover:bg-green-600 hover:ring-green-500',
    Fire: 'hover:bg-orange-500 hover:ring-orange-400',
    Water: 'hover:bg-blue-600 hover:ring-blue-500',
    Electric: 'hover:bg-yellow-400 hover:ring-yellow-300',
    Psychic: 'hover:bg-pink-400 hover:ring-pink-400',
    Ghost: 'hover:bg-indigo-800 hover:ring-indigo-700',
    Bug: 'hover:bg-lime-500 hover:ring-lime-400',
    Dark: 'hover:bg-gray-700 hover:ring-gray-600',
    Dragon: 'hover:bg-violet-700 hover:ring-violet-600',
    Fighting: 'hover:bg-red-700 hover:ring-red-600',
    Ground: 'hover:bg-yellow-700 hover:ring-yellow-600',
    Ice: 'hover:bg-cyan-200 hover:ring-cyan-300',
    Normal: 'hover:bg-gray-400 hover:ring-gray-300',
    Poison: 'hover:bg-purple-500 hover:ring-purple-400',
    Rock: 'hover:bg-yellow-800 hover:ring-yellow-700',
    Steel: 'hover:bg-gray-300 hover:ring-gray-400',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `hover:bg-[${typeHexColors[type]}]`;
  return 'hover:bg-gray-600 hover:ring-gray-500';
};

export const getTypeRingColor = (type) => {
  const tw = {
    Grass: 'ring-green-400',
    Fire: 'ring-orange-400',
    Water: 'ring-blue-400',
    Electric: 'ring-yellow-300',
    Psychic: 'ring-pink-400',
    Ghost: 'ring-indigo-700',
    Bug: 'ring-lime-400',
    Dark: 'ring-gray-600',
    Dragon: 'ring-violet-600',
    Fighting: 'ring-red-600',
    Ground: 'ring-yellow-600',
    Ice: 'ring-cyan-300',
    Normal: 'ring-gray-300',
    Poison: 'ring-purple-400',
    Rock: 'ring-yellow-700',
    Steel: 'ring-gray-400',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `ring-[${typeHexColors[type]}]`;
  return 'ring-gray-400';
};

export const getTypeBorderColor = (type) => {
  const tw = {
    Grass: 'border-green-600',
    Fire: 'border-orange-500',
    Water: 'border-blue-600',
    Electric: 'border-yellow-400',
    Psychic: 'border-pink-400',
    Ghost: 'border-indigo-800',
    Bug: 'border-lime-500',
    Dark: 'border-gray-700',
    Dragon: 'border-violet-700',
    Fighting: 'border-red-700',
    Ground: 'border-yellow-700',
    Ice: 'border-cyan-200',
    Normal: 'border-gray-400',
    Poison: 'border-purple-500',
    Rock: 'border-yellow-800',
    Steel: 'border-gray-300',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `border-[${typeHexColors[type]}]`;
  return 'border-gray-400';
};

export const getTypeBgColor = (type) => {
  const tw = {
    Grass: 'bg-green-100',
    Fire: 'bg-orange-100',
    Water: 'bg-blue-100',
    Electric: 'bg-yellow-100',
    Psychic: 'bg-pink-100',
    Ghost: 'bg-indigo-100',
    Bug: 'bg-lime-100',
    Dark: 'bg-gray-700',
    Dragon: 'bg-violet-100',
    Fighting: 'bg-red-200',
    Ground: 'bg-yellow-200',
    Ice: 'bg-cyan-100',
    Normal: 'bg-gray-200',
    Poison: 'bg-purple-100',
    Rock: 'bg-yellow-300',
    Steel: 'bg-gray-100',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `bg-[${typeHexColors[type]}]`;
  return 'bg-gray-100';
};

