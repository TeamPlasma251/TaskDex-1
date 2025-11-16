import React, { useState, useEffect } from 'react';
import { GYM_PROGRESSION, GYM_DIALOGUES } from '../data/gyms.js';
import { getGifUrl } from '../utils/sprites.js';
import { LEADER_SPRITES, LEADER_PLACEHOLDER } from '../data/leaderSprites.js';

// Transparent 1x1 GIF placeholder (blank) still kept for invisible spots if needed
const PLACEHOLDER_SPRITE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const style = {
  card: "bg-gray-800 text-white p-6 rounded-xl shadow-lg border border-gray-700",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-700 text-white hover:bg-gray-600",
  primaryButton: "bg-indigo-600 text-white hover:bg-indigo-500",
};

export default function AchievementsViewScreen({ setScreen, userData }) {
  const [selectedLeader, setSelectedLeader] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedLeader(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pokedexNames = (userData?.pokedex || []).map(p => p.name);

  const isDefeated = (requiredList = []) => {
    return (requiredList || []).every(name => pokedexNames.includes(name));
  };

  const kantoGyms = GYM_PROGRESSION.filter(g => g.id.startsWith('gym_'));
  const elite = GYM_PROGRESSION.filter(g => g.id.startsWith('e4_'));
  const champ = GYM_PROGRESSION.find(g => g.id === 'champ');

  const openLeader = (leader) => {
    setSelectedLeader(leader);
  };

  const closeModal = () => setSelectedLeader(null);

  const renderLeaderButton = (g) => {
    // Use trainer sprite mapping if available; otherwise fallback to SVG placeholder
    const spriteUrl = LEADER_SPRITES[g.leader] || LEADER_PLACEHOLDER;
    const defeated = isDefeated(g.requiredPokemon || []);

    return (
      <button
        key={g.id}
        onClick={() => openLeader(g)}
        className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md border border-gray-700 hover:scale-105 transition-transform relative w-36 h-36 bg-gray-900`}
        aria-label={`Open ${g.leader} gym`}
      >
        <img
          src={spriteUrl}
          alt={g.leader}
          style={{ width: 72, height: 72, imageRendering: 'pixelated' }}
          onError={(e) => { e.target.onerror = null; e.target.src = LEADER_PLACEHOLDER; }}
        />
        <div className="mt-2 text-sm font-bold text-white text-center">{g.leader}</div>
        <div className="text-xs text-gray-400">{g.type}</div>
        {defeated && (
          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">✓</div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-900 text-white">
      <div className={style.card + " max-w-6xl w-full text-center"}>
        <h2 className="text-4xl font-bold mb-6 text-white">Achievements</h2>

        {/* Kanto row 1 */}
        <div className="grid grid-cols-4 gap-6 mb-6 justify-items-center">
          {kantoGyms.slice(0,4).map(renderLeaderButton)}
        </div>

        {/* Kanto row 2 */}
        <div className="grid grid-cols-4 gap-6 mb-6 justify-items-center">
          {kantoGyms.slice(4,8).map(renderLeaderButton)}
        </div>

        {/* Elite Four */}
        <h3 className="text-2xl font-semibold my-4 text-white">Elite Four</h3>
        <div className="grid grid-cols-4 gap-6 mb-6 justify-items-center">
          {elite.map(renderLeaderButton)}
        </div>

        {/* Champion centered */}
        {champ && (
          <div className="flex justify-center mb-6">
            {renderLeaderButton(champ)}
          </div>
        )}

        <div className="flex justify-center">
          <button
            className={style.button + " " + style.primaryButton + " mt-4"}
            onClick={() => setScreen('MAIN_MENU')}
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Leader Modal */}
      {selectedLeader && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-700 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center space-x-4">
              <img
                src={LEADER_SPRITES[selectedLeader.leader] || LEADER_PLACEHOLDER}
                alt={selectedLeader.leader}
                style={{ width: 96, height: 96, imageRendering: 'pixelated' }}
                onError={(e) => { e.target.onerror = null; e.target.src = LEADER_PLACEHOLDER; }}
              />
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold">
                  {selectedLeader.leader}
                  {isDefeated(selectedLeader.requiredPokemon || []) && (
                    <span className="ml-2 text-green-400">✓ Defeated</span>
                  )}
                </h3>
                <div className="text-sm text-gray-300">Type: <strong className="text-white">{selectedLeader.type}</strong></div>
                <div className="text-sm text-gray-300">Badge: <strong className="text-white">{selectedLeader.badge}</strong></div>
              </div>
            </div>

            <p className="mt-4 text-gray-200">{GYM_DIALOGUES[selectedLeader.leader] || ''}</p>

            <div className="mt-4">
              <h4 className="font-semibold text-white">Pokédex requirements</h4>
              <p className="text-sm text-gray-400 mb-2">Collect these Pokémon in your Pokédex to defeat this leader. A check indicates you already have that Pokémon.</p>
              <div className="grid grid-cols-2 gap-2">
                {(selectedLeader.requiredPokemon || []).map(name => {
                  const has = pokedexNames.includes(name);
                  return (
                    <div key={name} className="flex items-center space-x-2 p-2 bg-gray-900 rounded-lg border border-gray-700">
                      <img
                        src={getGifUrl(name)}
                        alt={name}
                        style={{ width: 48, height: 48, imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_SPRITE; }}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">{name}</div>
                        {has ? <div className="text-xs text-green-400">In Pokédex ✓</div> : <div className="text-xs text-gray-400">Missing</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button className={style.button + " " + style.secondaryButton} onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
