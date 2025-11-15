import React from 'react';
import { formatTime } from '../utils/formatTime.js';
import { getGifUrl } from '../utils/sprites.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
};

export default function PomodoroRunningScreen({ setScreen, sessionConfig, userData, handleSessionComplete }) {
  const totalStudySeconds = sessionConfig?.studyTime * 60 || 0;
  const totalRestSeconds = sessionConfig?.restTime * 60 || 0;
  const initialTime = sessionConfig?.breakTriggered ? totalRestSeconds : totalStudySeconds;
  const initialPhase = sessionConfig?.breakTriggered ? 'Rest' : 'Study';
  
  const [timeLeft, setTimeLeft] = React.useState(initialTime);
  const [phase, setPhase] = React.useState(initialPhase);
  const [isRunning, setIsRunning] = React.useState(true);
  const timerRef = React.useRef(null);
  
  const partner = userData?.pokemon_inventory.find(p => p.isPartner);
  const partnerName = partner?.currentName || 'Charmander';
  const trainerSprite = userData?.trainerGender === 'male' ? 'TrainerMale' : 'TrainerFemale';
  const sessionType = sessionConfig?.type || 'Fire';
  
  // Timer logic
  React.useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      if (phase === 'Study') {
        handleSessionComplete(sessionConfig.studyTime, sessionType);
      } else if (phase === 'Rest') {
        setScreen('MAIN_MENU');
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, phase, sessionConfig, sessionType, handleSessionComplete, setScreen]);
  
  const handleSkip = () => {
    clearInterval(timerRef.current);
    setTimeLeft(0);
    if (phase === 'Study') {
      handleSessionComplete(sessionConfig.studyTime, sessionType);
    } else if (phase === 'Rest') {
      setScreen('MAIN_MENU');
    }
  };
  
  const isBreak = phase === 'Rest';
  const headerColor = isBreak ? 'text-green-400' : 'text-red-400';
  const totalTime = isBreak ? totalRestSeconds : totalStudySeconds;
  const progress = totalTime > 0 ? (1 - (timeLeft / totalTime)) * 100 : 0;
  
  // Map style
  const mapStyle = {
    backgroundImage: `url(https://raw.githubusercontent.com/wrish6/prototype/main/map_background.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'repeat',
    height: '40vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    border: '4px solid #4f46e5',
    borderRadius: '0.75rem',
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      <div className={style.card + " max-w-4xl w-full mt-12"}>
        <h2 className={`text-4xl font-bold mb-4 text-center ${isBreak ? 'text-green-600' : 'text-red-600'}`}>
          {phase === 'Study' ? `Focusing on ${sessionType} Flight` : 'BREAK TIME!'}
        </h2>
        
        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-7xl font-mono font-extrabold mb-2 text-black bg-gray-100 p-4 rounded-lg shadow-inner border-2 border-gray-300">
            {formatTime(timeLeft)}
          </div>
          <p className="text-gray-700 text-lg">
            {phase} Session | {sessionConfig.studyTime} Min Study / {sessionConfig.restTime} Min Rest
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-3 mb-8">
          <div className={`h-3 rounded-full ${isBreak ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }}></div>
        </div>
        
        {/* Map and Sprites */}
        <div style={mapStyle}>
          <style>{`
            @keyframes moveAcross1 {
              0% { transform: translateX(-10%) translateY(0) scaleX(1); }
              50% { transform: translateX(110%) translateY(20px) scaleX(-1); }
              100% { transform: translateX(-10%) translateY(0) scaleX(1); }
            }
            @keyframes moveAcross2 {
              0% { transform: translateX(110%) translateY(0) scaleX(1); }
              50% { transform: translateX(-10%) translateY(-20px) scaleX(-1); }
              100% { transform: translateX(110%) translateY(0) scaleX(1); }
            }
          `}</style>
          
          {/* Partner Pokémon Sprite (Animated) */}
          <img
            src={getGifUrl(partnerName)}
            alt={partnerName}
            style={{animation: 'moveAcross1 30s linear infinite', position: 'absolute', top: '50%', left: '0%', transform: 'translateY(-50%)', imageRendering: 'pixelated', width: '56px', height: '56px', zIndex: 10}}
            onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
          />
          
          {/* Trainer Sprite (Animated, slightly offset) */}
          <img
            src={getGifUrl(trainerSprite)}
            alt="Trainer"
            style={{animation: 'moveAcross2 25s linear infinite', position: 'absolute', top: '70%', left: '10%', imageRendering: 'pixelated', width: '56px', height: '56px', zIndex: 10}}
            onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl("Placeholder"); }}
          />
          
          <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg text-sm border-2 border-gray-300">
            <p className="text-red-600 font-semibold">Flight Zone: {sessionType}</p>
            <p className="text-gray-700">Partner: {partnerName}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className={style.button + " " + style.secondaryButton}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            className={style.button + " bg-yellow-500 text-gray-900 hover:bg-yellow-600"}
            onClick={handleSkip}
          >
            {phase === 'Study' ? 'Skip Study / End Session' : 'Skip Break / Return to Menu'}
          </button>
        </div>
      </div>
    </div>
  );
}

