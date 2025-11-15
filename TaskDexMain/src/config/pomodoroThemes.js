// Pomodoro Theme Configuration
// Maps task types to pixel art background themes
// 
// INSTRUCTIONS: Add your pixel art image URLs below
// You can use:
// - Local files: '/images/fire-theme.png' (place images in public/images/)
// - External URLs: 'https://example.com/fire-theme.png'
// - GitHub raw URLs: 'https://raw.githubusercontent.com/user/repo/main/fire-theme.png'
//
// Image descriptions:
// - Fire: Red liquid landscape with moon (dark sky, red liquid, blue moon, structures)
// - Electric: Night cityscape with power plant (dark blues/teals, orange/yellow lights, industrial)
// - Ghost: Graveyard scene (gothic, teal/green lighting, mausoleum, tombstones)
// - Grass: Fantasy landscape with floating castle (green hills, wildflowers, floating green structure)
// - Psychic: Night observatory with nebula (starry sky, colorful nebula, observatory, city lights)
// - Water: (Add your Water theme image)

// Theme images from local public/themes folder
// Images are stored in: public/themes/
// File names match task types: fire.jpg, grass.jpg, electric.png, ghost.webp, psychic.jpg, water.avif

export const POMODORO_THEMES = {
  Fire: {
    name: 'Fire',
    // Red liquid landscape with moon - dark sky, red liquid, blue moon, structures
    backgroundImage: '/themes/fire.jpg',
    overlay: 'rgba(139, 0, 0, 0.3)', // Dark red overlay
    textColor: '#ffffff',
    accentColor: '#dc2626',
  },
  Water: {
    name: 'Water',
    // Water theme
    backgroundImage: '/themes/water.avif',
    overlay: 'rgba(30, 58, 138, 0.4)', // Dark blue overlay
    textColor: '#ffffff',
    accentColor: '#2563eb',
  },
  Grass: {
    name: 'Grass',
    // Fantasy landscape with floating castle - green hills, wildflowers, floating green structure
    backgroundImage: '/themes/grass.jpg',
    overlay: 'rgba(20, 83, 45, 0.15)', // Lighter green overlay to show more of the pixel art
    textColor: '#ffffff',
    accentColor: '#16a34a',
  },
  Electric: {
    name: 'Electric',
    // Night cityscape with power plant - dark blues/teals, orange/yellow lights, industrial
    backgroundImage: '/themes/electric.png',
    overlay: 'rgba(234, 179, 8, 0.3)', // Yellow/gold overlay
    textColor: '#ffffff',
    accentColor: '#eab308',
  },
  Ghost: {
    name: 'Ghost',
    // Graveyard scene - gothic, teal/green lighting, mausoleum, tombstones
    backgroundImage: '/themes/ghost.webp',
    overlay: 'rgba(55, 48, 163, 0.5)', // Dark purple overlay
    textColor: '#ffffff',
    accentColor: '#6366f1',
  },
  Psychic: {
    name: 'Psychic',
    // Night observatory with nebula - starry sky, colorful nebula, observatory, city lights
    backgroundImage: '/themes/psychic.jpg',
    overlay: 'rgba(147, 51, 234, 0.4)', // Purple overlay
    textColor: '#ffffff',
    accentColor: '#a855f7',
  },
};

// Get theme by type
export const getThemeByType = (type) => {
  return POMODORO_THEMES[type] || POMODORO_THEMES.Fire;
};

// Default theme
export const DEFAULT_THEME = POMODORO_THEMES.Fire;

