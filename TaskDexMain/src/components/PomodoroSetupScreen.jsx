import React from 'react';
import { POKEMON_DATA } from '../data/pokemonData.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  primaryButton: "bg-red-600 text-white hover:bg-red-700",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
  input: "w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500",
};

export default function PomodoroSetupScreen({ setScreen, setSessionConfig }) {
  const [selectedType, setSelectedType] = React.useState('Psychic');
  const [studyTime, setStudyTime] = React.useState(30);
  const [restTime, setRestTime] = React.useState(5);
  
  const handleStartSession = () => {
    if (studyTime > 0) {
      setSessionConfig({ type: selectedType, studyTime, restTime });
      setScreen('POMODORO_RUNNING');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-lg w-full"}>
        <h2 className="text-3xl font-bold mb-6 text-black">Start Focus Session</h2>
        <div className="space-y-4 mb-8">
          {/* Session Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Encounter Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {POKEMON_DATA.SESSION_TYPES.map(type => (
                <button
                  key={type}
                  className={`py-2 rounded-lg font-semibold transition-colors duration-200 ${
                    selectedType === type ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Time (minutes):</label>
            <input
              type="number"
              value={studyTime}
              onChange={(e) => setStudyTime(Math.max(1, parseInt(e.target.value) || 0))}
              className={style.input}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rest Time (minutes):</label>
            <input
              type="number"
              value={restTime}
              onChange={(e) => setRestTime(Math.max(0, parseInt(e.target.value) || 0))}
              className={style.input}
              min="0"
            />
          </div>
        </div>
        
        <button
          className={style.button + " " + style.primaryButton + " w-full"}
          onClick={handleStartSession}
          disabled={studyTime <= 0}
        >
          Start Session ({studyTime} min Study)
        </button>
        
        <button
          className="mt-4 w-full text-sm text-gray-700 hover:text-red-600"
          onClick={() => setScreen('MAIN_MENU')}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

