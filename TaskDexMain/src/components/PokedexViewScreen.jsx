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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full text-center"}>
        <h2 className="text-3xl font-bold mb-6 text-black">Pokédex View</h2>
        <h3 className="text-xl font-semibold mb-4 text-black">Registered Species ({userData?.pokedex.length || 0})</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto p-4 bg-gray-100 rounded-lg mx-auto border-2 border-gray-300">
          {sortedPokedex.map(mon => (
            <div key={mon.id} className="text-center p-2 bg-white rounded-lg border-2 border-gray-300">
              <img 
                src={getGifUrl(mon.name)} 
                alt={mon.name}
                className="mx-auto" 
                style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }}
                onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
              />
              <p className="text-xs mt-1">{mon.name}</p>
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

