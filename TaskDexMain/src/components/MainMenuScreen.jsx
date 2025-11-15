import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { POKEMON_DATA } from '../data/pokemonData.js';

const style = {
  card: "bg-white p-8 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-8 py-4 rounded-xl font-bold transition-colors duration-300 shadow-md text-lg",
};

export default function MainMenuScreen({ setScreen, userData, setSessionConfig }) {
  const firstPokemon = userData?.pokemon_inventory.find(p => p.isPartner)?.currentName || 'N/A';
  const trainerName = userData?.trainerName || 'Trainer';
  const [selectedType, setSelectedType] = React.useState('Psychic');
  const [studyTime, setStudyTime] = React.useState(30);
  const [restTime, setRestTime] = React.useState(5);

  const handleStartSession = () => {
    if (studyTime > 0 && setSessionConfig) {
      setSessionConfig({ type: selectedType, studyTime, restTime });
      setScreen('POMODORO_RUNNING');
    }
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-2xl w-full mt-8"}>
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-black mb-2">Welcome Back, {trainerName}!</h2>
          <p className="text-gray-700">
            Your partner, <span className="font-semibold text-green-600">{firstPokemon}</span>, is ready to focus.
          </p>
        </div>

        {/* Pomodoro Selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-black mb-3">Select Focus Type:</label>
            <div className="grid grid-cols-3 gap-3">
              {POKEMON_DATA.SESSION_TYPES.map(type => (
                <button
                  key={type}
                  className={`py-4 rounded-xl font-bold transition-all duration-200 border-2 ${
                    selectedType === type 
                      ? 'bg-red-600 text-white border-red-700 shadow-lg scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-black border-gray-300'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Study Time (minutes):</label>
              <input
                type="number"
                value={studyTime}
                onChange={(e) => setStudyTime(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500 text-lg font-semibold"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rest Time (minutes):</label>
              <input
                type="number"
                value={restTime}
                onChange={(e) => setRestTime(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500 text-lg font-semibold"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <button
          className={style.button + " bg-red-600 hover:bg-red-700 text-white w-full mt-8"}
          onClick={handleStartSession}
          disabled={studyTime <= 0}
        >
          Start Focus Session ({studyTime} min)
        </button>
      </div>
    </div>
  );
}

