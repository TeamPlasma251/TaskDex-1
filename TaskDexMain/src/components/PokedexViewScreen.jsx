import React from 'react';
import { getGifUrl } from '../utils/sprites.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
};

export default function PokedexViewScreen({ setScreen, userData }) {
  const sortedPokedex = [...(userData?.pokedex || [])].sort((a, b) => a.id - b.id);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-7xl w-full text-center"}>
        <h2 className="main-tab-title mb-8 text-black">Pokédex View</h2>
        <h3 className="text-2xl font-semibold mb-8 text-black">Registered Species ({userData?.pokedex.length || 0})</h3>
        <div 
          className="grid grid-cols-9 md:grid-cols-9 lg:grid-cols-9 gap-6 overflow-y-auto p-6 bg-gray-100 rounded-lg mx-auto border-2 border-gray-300"
          style={{ gridAutoRows: '150px', maxHeight: 'calc(6 * 150px + 2 * 1.5rem)' }}
        >
          {sortedPokedex.map(mon => (
            <div key={mon.id} className="pokemon-card dex-card bg-white rounded-lg border-2 border-gray-300 hover:scale-105 transition-transform">
              <div className="flex items-center justify-center mt-2">
                <img 
                  src={getGifUrl(mon.name)} 
                  alt={mon.name}
                  className="dex-sprite" 
                  onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
                />
              </div>
              <p className="text-xs font-semibold mt-2">{mon.name}</p>
            </div>
          ))}
        </div>
        <button
          className={style.button + " " + style.secondaryButton + " mt-8"}
          onClick={() => setScreen('MAIN_MENU')}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

