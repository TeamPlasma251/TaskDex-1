import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { POKEMON_DATA } from '../data/pokemonData.js';
import { getTypeHoverColor } from '../utils/typeColors.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
};

export default function PokedexViewScreen({ setScreen, userData }) {
  const caughtNames = new Set((userData?.pokedex || []).map(p => p.name));

  const questionMarkSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='56' height='56' fill='%23f3f4f6' rx='8'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='%23343a40' font-family='Arial'>?</text></svg>`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-6xl w-full text-center"}>
        <h2 className="text-3xl font-bold mb-6 text-black">Pokédex</h2>
        <h3 className="text-xl font-semibold mb-4 text-black">Registered Species ({userData?.pokedex.length || 0}) — Showing 1–251</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 max-h-[70vh] overflow-y-auto p-4 bg-gray-100 rounded-lg mx-auto border-2 border-gray-300">
          {POKEMON_DATA.list.map(mon => {
            const caught = caughtNames.has(mon.name);
            const imgSrc = caught ? getGifUrl(mon.name) : questionMarkSvg;
            const typeHoverClass = getTypeHoverColor(mon.type);
            return (
              <div key={mon.id} className={`text-center p-2 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center cursor-pointer ${typeHoverClass} hover:ring-2 transition-all`}>
                <div className="text-xs text-gray-600 w-full text-left">#{String(mon.id).padStart(3, '0')}</div>
                <img
                  src={imgSrc}
                  alt={caught ? mon.name : 'Unknown'}
                  className="mx-auto"
                  style={{ width: '56px', height: '56px', imageRendering: caught ? 'pixelated' : 'auto' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = questionMarkSvg; }}
                />
                <p className="text-xs mt-1">{caught ? mon.name : '---'}</p>
              </div>
            );
          })}
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

