import React from 'react';
import { getGifUrl } from '../utils/sprites.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
};

export default function MainMenuScreen({ setScreen, userData, handleLogout, handleUnlockPokedex }) {
  const firstPokemon = userData?.pokemon_inventory.find(p => p.isPartner)?.currentName || 'N/A';
  const trainerName = userData?.trainerName || 'Trainer';
  const trainerSprite = userData?.trainerGender === 'male' ? 'TrainerMale' : 'TrainerFemale';
  
  const menuItems = [
    { name: "Start Session", screen: 'POMODORO_SETUP', icon: '⏱️' },
    { name: "Pokedex", screen: 'POKEDEX_VIEW', icon: '📖' },
    { name: "Friends", screen: 'FRIENDS_LIST', icon: '🫂' },
    { name: "Achievements", screen: 'ACHIEVEMENTS_VIEW', icon: '🏆' },
  ];
  
  const handleMenuClick = (screen) => {
    setScreen(screen);
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full mt-12"}>
        {/* Personalized Welcome & Sprite Display */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold text-black">Welcome Back, {trainerName}!</h2>
            <p className="text-gray-700 mt-2">
              Your partner, <span className="font-semibold text-green-600">{firstPokemon}</span>, is ready.
            </p>
          </div>
          <div className="flex space-x-2 bg-gray-100 p-3 rounded-xl border-2 border-gray-300">
            <img 
              src={getGifUrl(trainerSprite)} 
              alt="Trainer" 
              style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }}
              onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
            />
            <img 
              src={getGifUrl(firstPokemon)} 
              alt="Partner" 
              style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }}
              onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`${style.button} bg-red-600 hover:bg-red-700 text-white flex flex-col items-center space-y-2 py-8`}
              onClick={() => handleMenuClick(item.screen)}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-lg">{item.name}</span>
            </button>
          ))}
        </div>
        
        {/* Dev Tools moved to Profile Screen */}
      </div>
    </div>
  );
}

