import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { getPokemonDataByName } from '../data/pokemonData.js';
import { getTypeHoverColor, getTypeBorderColor, getTypeRingColor } from '../utils/typeColors.js';

const style = {
  card: "bg-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-gray-700",
  button: "px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105",
  secondaryButton: "bg-gray-700 text-white hover:bg-gray-600",
};

export default function PartnerSelectScreen({ 
  setScreen, 
  userData, 
  handleLogout, 
  handleSetNewPartner, 
  handleEvolvePartner, 
  handleUnlockPokedex, 
  handleRevertPokedex 
}) {
  const trainerSprite = userData?.trainerGender === 'male' ? 'TrainerMale' : 'TrainerFemale';
  const currentPartner = userData.pokemon_inventory.find(p => p.isPartner);
  const availablePokemon = userData.pokemon_inventory.filter(p => !p.isPartner);
  const isDevModeOn = !!userData?.original_progress_backup;
  
  // Check if partner is ready to evolve
  const partnerData = currentPartner ? getPokemonDataByName(currentPartner.currentName) : null;
  const isReadyToEvolve = partnerData && partnerData.evoExp !== -1 && currentPartner.exp >= partnerData.evoExp;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#1a1a1a] text-white animate-fadeIn">
      <div className={style.card + " max-w-7xl w-full mt-6"}>
        <h2 className="main-tab-title mb-8 text-white text-center">Trainer Profile</h2>

        {/* Trainer and Partner Display */}
        <div className="flex justify-center items-center space-x-12 bg-gray-900 p-8 rounded-xl mb-10 border-2 border-gray-700 shadow-lg">
          <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <img 
              src={getGifUrl(trainerSprite)} 
              alt="Trainer" 
              className="bg-gray-800 rounded-full p-2 border-2 border-blue-500"
              style={{ width: '120px', height: '120px', imageRendering: 'pixelated' }}
              onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
            />
            <p className="mt-3 text-lg font-semibold text-white">{userData.trainerName}</p>
          </div>
          {currentPartner && (
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <img 
                src={getGifUrl(currentPartner.currentName)} 
                alt="Partner" 
              className={`bg-gray-800 p-2 border-4 border-gray-700 rounded-none`}
              style={{ width: '120px', height: '120px', imageRendering: 'pixelated', objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
            />
            <p className="mt-3 text-lg font-semibold text-white">{currentPartner.currentName}</p>
              {/* EXP Display */}
              {partnerData && partnerData.evoExp !== -1 ? (
                <div className="mt-3">
                  <p className="text-sm text-gray-400 font-semibold">
                    EXP: {Math.floor(currentPartner.exp || 0)} / {partnerData.evoExp}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-2 max-w-[150px] mx-auto">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(((currentPartner.exp || 0) / partnerData.evoExp) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-3">Max Level</p>
              )}
              {/* Show Evolve Button or "Current Partner" */}
              {isReadyToEvolve ? (
                <button 
                  className={style.button + " bg-yellow-500 text-black text-sm py-2 mt-3 animate-pulse hover:bg-yellow-400"}
                  onClick={() => handleEvolvePartner(currentPartner.id)}
                >
                  Evolve!
                </button>
              ) : (
                <p className="text-sm text-gray-700 mt-3">Current Partner</p>
              )}
            </div>
          )}
        </div>

        {/* Available Pokémon Grid */}
        <h3 className="text-3xl font-semibold text-white mb-6">My Pokémon ({availablePokemon.length})</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 max-h-96 overflow-y-auto p-6 bg-gray-900 rounded-xl mb-8 border-2 border-gray-700 shadow-lg">
          {availablePokemon.length === 0 && (
            <p className="text-gray-500 col-span-full text-center text-lg">Catch more Pokémon to build your party!</p>
          )}
          {availablePokemon.map((mon, index) => {
            const evoData = getPokemonDataByName(mon.currentName);
            const expPercent = evoData && evoData.evoExp > 0 ? (mon.exp / evoData.evoExp) * 100 : 100;
            const isEvoReady = evoData && evoData.evoExp !== -1 && mon.exp >= evoData.evoExp;
            const typeHoverClass = getTypeHoverColor(mon.type);
            const typeRingClass = getTypeRingColor(mon.type);

            return (
              <div 
                key={mon.id} 
                className={`text-center p-3 bg-gray-800 rounded-xl cursor-pointer border-2 border-gray-600 ${typeHoverClass} hover:ring-4 ${typeRingClass} transition-all duration-300 relative transform hover:scale-105`}
                onClick={() => handleSetNewPartner(mon.id, { skipNavigation: true })}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Evolution indicator for non-partners */}
                {isEvoReady && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs animate-pulse border-2 border-white shadow-lg">
                    !
                  </span>
                )}
                <img 
                  src={getGifUrl(mon.currentName)} 
                  alt={mon.currentName}
                  className="mx-auto" 
                  style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                />
                <p className="text-sm mt-2 text-white font-semibold">{mon.currentName}</p>
                {/* EXP Display */}
                {evoData && evoData.evoExp !== -1 ? (
                  <>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                      {Math.floor(mon.exp || 0)} / {evoData.evoExp}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(expPercent, 100)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Max Level</p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <button
            className={style.button + " " + style.secondaryButton}
            onClick={() => setScreen('MAIN_MENU')}
          >
            Back to Menu
          </button>
          <button 
            className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors duration-200"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
        
        {/* Dev Tool Toggle in Profile Screen */}
        <div className="flex justify-center items-center mt-4 p-3 bg-gray-900 rounded-lg border-2 border-gray-700 w-full">
          {isDevModeOn ? (
            <button 
              className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors duration-200"
              onClick={handleRevertPokedex}
            >
              [Dev Tool: Revert to Original Progress]
            </button>
          ) : (
            <button 
              className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold transition-colors duration-200"
              onClick={handleUnlockPokedex}
            >
              [Dev Tool: Unlock All Pokémon]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


