import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { getTypeBorderColor } from '../utils/typeColors.js';
import { getPokemonDataByName } from '../data/pokemonData.js';

export default function TopNavigationBar({ setScreen, userData, currentScreen }) {
  const trainerSprite = userData?.trainerGender === 'male' ? 'TrainerMale' : 'TrainerFemale';
  const partner = userData?.pokemon_inventory.find(p => p.isPartner);
  
  // Check if partner is ready to evolve
  const partnerData = partner ? getPokemonDataByName(partner.currentName) : null;
  const isReadyToEvolve = partner && partnerData && partnerData.evoExp !== -1 && partner.exp >= partnerData.evoExp;
  
  const navItems = [
    { name: "My Tasks", screen: 'TASKS_SCREEN', icon: '📝' },
    { name: "Pokédex", screen: 'POKEDEX_VIEW', icon: '📖' },
    { name: "Friends", screen: 'FRIENDS_LIST', icon: '🫂' },
    { name: "Achievements", screen: 'ACHIEVEMENTS_VIEW', icon: '🏆' },
  ];

  // Don't show navigation on these screens
  const hideNavScreens = ['WELCOME', 'LOGIN_SIGNUP', 'STARTER_SELECT', 'POMODORO_RUNNING', 'ENCOUNTER_SCREEN', 'POMODORO_SETUP'];
  if (hideNavScreens.includes(currentScreen) || !userData) {
    return null;
  }

  return (
    <nav className="bg-white border-b-2 border-gray-300 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold text-black">TaskMon</span>
          </div>

          {/* Center - Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 ${
                  currentScreen === item.screen
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right side - Trainer and Partner Sprites */}
          <div className="flex items-center space-x-2">
            {/* Trainer Profile Icon */}
            <div 
              className="relative cursor-pointer p-1 bg-white rounded-full border-2 border-red-600 hover:bg-red-100 transition-all shadow-lg"
              onClick={() => setScreen('PARTNER_SELECT_SCREEN')}
            >
              <img 
                src={getGifUrl(trainerSprite)} 
                alt="Profile"
                style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }}
                onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                className="rounded-full"
              />
              {/* Evolution notification */}
              {isReadyToEvolve && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse border-2 border-white">
                  !
                </span>
              )}
            </div>
            
            {/* Partner Sprite with Type-Colored Circle */}
            {partner && (
              <div 
                className={`rounded-full p-1 border-2 ${getTypeBorderColor(partner.type)} cursor-pointer hover:scale-110 transition-transform`}
                onClick={() => setScreen('PARTNER_SELECT_SCREEN')}
              >
                <img 
                  src={getGifUrl(partner.currentName)} 
                  alt="Partner" 
                  style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                  className="rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

