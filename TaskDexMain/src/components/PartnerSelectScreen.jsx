import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { getPokemonDataByName } from '../data/pokemonData.js';
import { getTypeHoverColor, getTypeBorderColor } from '../utils/typeColors.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
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
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full mt-12"}>
        <h2 className="text-4xl font-bold mb-6 text-center text-black">Trainer Profile</h2>

        {/* Trainer and Partner Display */}
        <div className="flex justify-center items-center space-x-8 bg-gray-100 p-6 rounded-xl mb-8 border-2 border-gray-300">
          <div className="text-center">
            <img 
              src={getGifUrl(trainerSprite)} 
              alt="Trainer" 
              className="bg-white rounded-full p-2 border-2 border-blue-600"
              style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }}
              onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
            />
            <p className="mt-2 text-lg font-semibold">{userData.trainerName}</p>
          </div>
          {currentPartner && (
            <div className="text-center">
              <img 
                src={getGifUrl(currentPartner.currentName)} 
                alt="Partner" 
                className={`bg-white rounded-full p-2 border-4 ${getTypeBorderColor(currentPartner.type)}`}
                style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }}
                onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
              />
              <p className="mt-2 text-lg font-semibold">{currentPartner.currentName}</p>
              {/* EXP Display */}
              {partnerData && partnerData.evoExp !== -1 ? (
                <div className="mt-2">
                  <p className="text-sm text-black font-semibold">
                    EXP: {Math.floor(currentPartner.exp || 0)} / {partnerData.evoExp}
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-1 max-w-[120px] mx-auto">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(((currentPartner.exp || 0) / partnerData.evoExp) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">Max Level</p>
              )}
              {/* Show Evolve Button or "Current Partner" */}
              {isReadyToEvolve ? (
                <button 
                  className={style.button + " bg-yellow-500 text-black text-sm py-1 mt-2 animate-pulse"}
                  onClick={() => handleEvolvePartner(currentPartner.id)}
                >
                  Evolve!
                </button>
              ) : (
                <p className="text-sm text-gray-600 mt-2">Current Partner</p>
              )}
            </div>
          )}
        </div>

        {/* Available Pokémon Grid */}
        <h3 className="text-2xl font-semibold text-black mb-4">My Pokémon ({availablePokemon.length})</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-60 overflow-y-auto p-4 bg-gray-100 rounded-lg mb-8 border-2 border-gray-300">
          {availablePokemon.length === 0 && (
            <p className="text-gray-600 col-span-full text-center">Catch more Pokémon to build your party!</p>
          )}
          {availablePokemon.map(mon => {
            const evoData = getPokemonDataByName(mon.currentName);
            const expPercent = evoData && evoData.evoExp > 0 ? (mon.exp / evoData.evoExp) * 100 : 100;
            const isEvoReady = evoData && evoData.evoExp !== -1 && mon.exp >= evoData.evoExp;
            const typeHoverClass = getTypeHoverColor(mon.type);

            return (
              <div 
                key={mon.id} 
                className={`text-center p-2 bg-white rounded-lg cursor-pointer ${typeHoverClass} hover:ring-2 transition-all relative border-2 border-gray-300`}
                onClick={() => handleSetNewPartner(mon.id)}
              >
                {/* Evolution indicator for non-partners */}
                {isEvoReady && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs animate-pulse border-2 border-white">
                    !
                  </span>
                )}
                <div className={`mx-auto rounded-full p-1 border-2 ${getTypeBorderColor(mon.type)} inline-block`}>
                  <img 
                    src={getGifUrl(mon.currentName)} 
                    alt={mon.currentName}
                    className="mx-auto" 
                    style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                  />
                </div>
                <p className="text-xs mt-1">{mon.currentName}</p>
                {/* EXP Display */}
                {evoData && evoData.evoExp !== -1 ? (
                  <>
                    <p className="text-xs text-black mt-1 font-semibold">
                      {Math.floor(mon.exp || 0)} / {evoData.evoExp}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(expPercent, 100)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Max Level</p>
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
            className="text-red-600 hover:text-red-700 text-sm font-semibold"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
        
        {/* Dev Tool Toggle in Profile Screen */}
        <div className="flex justify-center items-center mt-4 p-2 bg-gray-100 rounded-lg border-2 border-gray-300 w-full">
          {isDevModeOn ? (
            <button 
              className="text-red-600 hover:text-red-700 text-xs font-semibold"
              onClick={handleRevertPokedex}
            >
              [Dev Tool: Revert to Original Progress]
            </button>
          ) : (
            <button 
              className="text-yellow-600 hover:text-yellow-700 text-xs font-semibold"
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


