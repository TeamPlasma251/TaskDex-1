import React from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { getPokemonDataByName } from '../data/pokemonData.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  primaryButton: "bg-red-600 text-white hover:bg-red-700",
};

export default function StarterSelectScreen({ saveNewUser, setScreen, userData }) {
  const [selectedStarter, setSelectedStarter] = React.useState(null);
  const [selectedGender, setSelectedGender] = React.useState('male');
  
  const starters = React.useMemo(() => ['Charmander', 'Squirtle', 'Bulbasaur'], []);
  
  const handleSelectStarter = () => {
    if (selectedStarter) {
      saveNewUser(selectedStarter, selectedGender);
    }
  };
  
  if (userData?.isProfileComplete) {
    setScreen('MAIN_MENU');
    return null;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full text-center"}>
        <h2 className="text-3xl font-bold mb-4 text-black">Choose Your Partner</h2>
        <p className="text-gray-700 mb-8">Select your starter Pokémon and trainer avatar to begin your journey.</p>
        
        {/* Gender Sprite Selection */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
          <h3 className="text-xl font-semibold mb-3">Trainer Avatar</h3>
          <div className="flex justify-center space-x-8">
            <div
              className={`cursor-pointer p-3 rounded-full ${selectedGender === 'male' ? 'ring-4 ring-blue-500' : 'ring-1 ring-gray-600'}`}
              onClick={() => setSelectedGender('male')}
            >
              <img src={getGifUrl('TrainerMale')} alt="Male Trainer" style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }} onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }} />
              <p className="text-sm mt-1">Male</p>
            </div>
            <div
              className={`cursor-pointer p-3 rounded-full ${selectedGender === 'female' ? 'ring-4 ring-pink-500' : 'ring-1 ring-gray-600'}`}
              onClick={() => setSelectedGender('female')}
            >
              <img src={getGifUrl('TrainerFemale')} alt="Female Trainer" style={{ width: '56px', height: '56px', imageRendering: 'pixelated' }} onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}/>
              <p className="text-sm mt-1">Female</p>
            </div>
          </div>
        </div>
        
        {/* Starter Pokémon Selection */}
        <div className="grid grid-cols-3 gap-6">
          {starters.map(name => (
            <div
              key={name}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${selectedStarter === name ? 'border-red-600 bg-red-100' : 'border-gray-300 bg-white hover:border-gray-500'}`}
              onClick={() => setSelectedStarter(name)}
            >
              <img
                src={getGifUrl(name)}
                alt={name}
                className="mx-auto rounded-lg mb-2"
                style={{ imageRendering: 'pixelated', width: '56px', height: '56px' }}
                onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }} 
              />
              <p className="text-lg font-semibold text-center">{name}</p>
              <p className="text-xs text-gray-600">{getPokemonDataByName(name)?.type} Type</p>
            </div>
          ))}
        </div>
        
        <button
          className={style.button + " " + style.primaryButton + " w-full mt-8"}
          onClick={handleSelectStarter}
          disabled={!selectedStarter}
        >
          Start Adventure with {selectedStarter || '...'}
        </button>
      </div>
    </div>
  );
}

