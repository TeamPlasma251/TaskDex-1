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
  const tw = {
    Grass: 'hover:bg-green-500 hover:ring-green-400',
    Fire: 'hover:bg-orange-400 hover:ring-orange-300',
    Water: 'hover:bg-blue-500 hover:ring-blue-400',
    Electric: 'hover:bg-yellow-300 hover:ring-yellow-200',
    Psychic: 'hover:bg-pink-400 hover:ring-pink-300',
    Ghost: 'hover:bg-indigo-600 hover:ring-indigo-500',
    Bug: 'hover:bg-lime-400 hover:ring-lime-300',
    Dark: 'hover:bg-gray-600 hover:ring-gray-500',
    Dragon: 'hover:bg-violet-600 hover:ring-violet-500',
    Fighting: 'hover:bg-red-600 hover:ring-red-500',
    Ground: 'hover:bg-yellow-500 hover:ring-yellow-400',
    Ice: 'hover:bg-cyan-300 hover:ring-cyan-200',
    Normal: 'hover:bg-gray-400 hover:ring-gray-300',
    Poison: 'hover:bg-purple-500 hover:ring-purple-400',
    Rock: 'hover:bg-yellow-600 hover:ring-yellow-500',
    Steel: 'hover:bg-gray-300 hover:ring-gray-200',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `hover:bg-[${typeHexColors[type]}]`;
  return 'hover:bg-gray-500 hover:ring-gray-400';
};

export const getTypeRingColor = (type) => {
  const tw = {
    Grass: 'ring-green-400',
    Fire: 'ring-orange-300',
    Water: 'ring-blue-400',
    Electric: 'ring-yellow-200',
    Psychic: 'ring-pink-300',
    Ghost: 'ring-indigo-500',
    Bug: 'ring-lime-300',
    Dark: 'ring-gray-500',
    Dragon: 'ring-violet-500',
    Fighting: 'ring-red-500',
    Ground: 'ring-yellow-400',
    Ice: 'ring-cyan-200',
    Normal: 'ring-gray-300',
    Poison: 'ring-purple-400',
    Rock: 'ring-yellow-500',
    Steel: 'ring-gray-200',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `ring-[${typeHexColors[type]}]`;
  return 'ring-gray-400';
};

export const getTypeBorderColor = (type) => {
  const tw = {
    Grass: 'border-green-500',
    Fire: 'border-orange-400',
    Water: 'border-blue-500',
    Electric: 'border-yellow-300',
    Psychic: 'border-pink-400',
    Ghost: 'border-indigo-600',
    Bug: 'border-lime-400',
    Dark: 'border-gray-600',
    Dragon: 'border-violet-600',
    Fighting: 'border-red-600',
    Ground: 'border-yellow-500',
    Ice: 'border-cyan-300',
    Normal: 'border-gray-400',
    Poison: 'border-purple-500',
    Rock: 'border-yellow-600',
    Steel: 'border-gray-300',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `border-[${typeHexColors[type]}]`;
  return 'border-gray-400';
};

export const getTypeBgColor = (type) => {
  const tw = {
    Grass: 'bg-green-400',
    Fire: 'bg-orange-300',
    Water: 'bg-blue-400',
    Electric: 'bg-yellow-200',
    Psychic: 'bg-pink-300',
    Ghost: 'bg-indigo-500',
    Bug: 'bg-lime-300',
    Dark: 'bg-gray-500',
    Dragon: 'bg-violet-500',
    Fighting: 'bg-red-500',
    Ground: 'bg-yellow-400',
    Ice: 'bg-cyan-200',
    Normal: 'bg-gray-300',
    Poison: 'bg-purple-400',
    Rock: 'bg-yellow-500',
    Steel: 'bg-gray-200',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `bg-[${typeHexColors[type]}]`;
  return 'bg-gray-300';
};

export const getTypeButtonColor = (type) => {
  const tw = {
    Grass: 'bg-green-800 text-white',
    Fire: 'bg-orange-800 text-white',
    Water: 'bg-blue-800 text-white',
    Electric: 'bg-yellow-700 text-black',
    Psychic: 'bg-pink-800 text-white',
    Ghost: 'bg-indigo-900 text-white',
    Bug: 'bg-lime-800 text-white',
    Dark: 'bg-gray-900 text-white',
    Dragon: 'bg-violet-900 text-white',
    Fighting: 'bg-red-900 text-white',
    Ground: 'bg-yellow-900 text-black',
    Ice: 'bg-cyan-800 text-black',
    Normal: 'bg-gray-700 text-white',
    Poison: 'bg-purple-900 text-white',
    Rock: 'bg-yellow-900 text-black',
    Steel: 'bg-gray-800 text-white',
  };
  if (tw[type]) return tw[type];
  if (typeHexColors[type]) return `bg-[${typeHexColors[type]}] text-white`;
  return 'bg-gray-800 text-white';
};

