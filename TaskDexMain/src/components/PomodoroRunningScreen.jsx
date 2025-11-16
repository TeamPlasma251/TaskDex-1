import React from 'react';
import { formatTime } from '../utils/formatTime.js';
import { getRandomWildPokemon } from '../data/pokemonData.js';
import { getGifUrl } from '../utils/sprites.js';
import { getTypeHoverColor, getTypeBorderColor, getTypeBgColor, getTypeRingColor } from '../utils/typeColors.js';
import { getThemeByType } from '../config/pomodoroThemes.js';

const style = {
  // made translucent + backdrop blur so background shows through
  card: "bg-gray-800/60 backdrop-blur-md p-6 rounded-xl shadow-lg border-2 border-gray-700",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
};

// --- GitHub-hosted sound files ---
const SPAWN_SOUND_URL = "https://raw.githubusercontent.com/wrish6/prototype/main/pokemon_center_heal.mp3";
const CAUGHT_SOUND_URL = "https://raw.githubusercontent.com/wrish6/prototype/main/06-caught-a-pokemon.mp3";

// -----------------------------------------------------------------
// 🔊 === AUDIO HELPERS (CLEAN FINAL VERSION) ===
// -----------------------------------------------------------------

let spawnAudioPromise = null;
let caughtAudioPromise = null;

async function ensureSpawnAudio() {
  if (typeof window === 'undefined') return null;
  if (spawnAudioPromise) return spawnAudioPromise;

  spawnAudioPromise = new Promise(async resolve => {
    try {
      console.log("[audio] loading spawn…");

      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 0.9;

      // Try blob fetch (GitHub CORS-safe)
      try {
        const resp = await fetch(SPAWN_SOUND_URL);
        if (!resp.ok) throw new Error("GitHub fetch failed: " + resp.status);

        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        audio.load();

        console.log("[audio] Spawn loaded from blob URL");
      } catch (err) {
        console.warn("[audio] Spawn blob load failed, fallback to direct URL", err);
        audio.src = SPAWN_SOUND_URL;
        audio.load();
      }

      audio.onerror = (e) => {
        console.error("[audio] HTMLAudioElement error (spawn):", e);
      };

      window.spawnAudio = audio;
      resolve(audio);
    } catch (e) {
      console.error("[audio] ensureSpawnAudio() error:", e);
      resolve(null);
    }
  });

  return spawnAudioPromise;
}

async function ensureCaughtAudio() {
  if (typeof window === 'undefined') return null;
  if (caughtAudioPromise) return caughtAudioPromise;

  caughtAudioPromise = new Promise(async resolve => {
    try {
      console.log("[audio] loading caught…");

      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 0.9;

      try {
        const resp = await fetch(CAUGHT_SOUND_URL);
        if (!resp.ok) throw new Error("GitHub fetch failed: " + resp.status);

        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        audio.src = blobUrl;
        audio.load();

        console.log("[audio] Caught loaded from blob URL");
      } catch (err) {
        console.warn("[audio] Caught blob load failed, fallback to direct URL", err);
        audio.src = CAUGHT_SOUND_URL;
        audio.load();
      }

      audio.onerror = (e) => {
        console.error("[audio] HTMLAudioElement error (caught):", e);
      };

      window.caughtAudio = audio;
      resolve(audio);
    } catch (e) {
      console.error("[audio] ensureCaughtAudio() error:", e);
      resolve(null);
    }
  });

  return caughtAudioPromise;
}

// Try to unlock audio by playing muted for a split second
async function unlockSpawnAudio() {
  try {
    const audio = await ensureSpawnAudio();
    if (!audio) return;

    audio.muted = true;
    audio.currentTime = 0;

    const p = audio.play();
    if (p) await p.catch(() => {});

    audio.pause();
    audio.muted = false;

    console.log("[audio] spawn unlock attempt finished");
  } catch (e) {
    console.error("[audio] spawn unlock error:", e);
  }
}

async function unlockCaughtAudio() {
  try {
    const audio = await ensureCaughtAudio();
    if (!audio) return;

    audio.muted = true;
    audio.currentTime = 0;

    const p = audio.play();
    if (p) await p.catch(() => {});

    audio.pause();
    audio.muted = false;

    console.log("[audio] caught unlock attempt finished");
  } catch (e) {
    console.error("[audio] caught unlock error:", e);
  }
}

async function playSpawnSound() {
  try {
    const audio = await ensureSpawnAudio();
    if (!audio) {
      console.warn("[audio] No spawn audio instance");
      return;
    }

    try {
      audio.currentTime = 0;
    } catch (e) {
      // ignore
    }

    const p = audio.play();
    if (p) {
      p.then(() => {
        console.log("[audio] Playing spawn sound");
      }).catch(err => {
        console.warn("[audio] spawn play() rejected", err);
      });
    }
  } catch (err) {
    console.error("[audio] playSpawnSound error:", err);
  }
}

async function playCaughtSound() {
  try {
    const audio = await ensureCaughtAudio();
    if (!audio) {
      console.warn("[audio] No caught audio instance");
      return;
    }

    try {
      audio.currentTime = 0;
    } catch (e) {
      // ignore
    }

    const p = audio.play();
    if (p) {
      p.then(() => {
        console.log("[audio] Playing caught sound");
      }).catch(err => {
        console.warn("[audio] caught play() rejected", err);
      });
    }
  } catch (err) {
    console.error("[audio] playCaughtSound error:", err);
  }
}


// =====================================================================
// MAIN COMPONENT
// =====================================================================
export default function PomodoroRunningScreen({
  setScreen,
  sessionConfig,
  userData,
  handleSessionComplete,
  saveCaughtPokemon,
  groupSessionData = null
}) {
  const workDuration = sessionConfig?.studyTime || 30;
  const breakDuration = sessionConfig?.restTime || 5;
  const numSessions = sessionConfig?.numSessions || 4;
  const taskName = sessionConfig?.taskName || 'Focus Session';
  const sessionType = sessionConfig?.type || 'Fire';
  const isGroupSession = !!groupSessionData;

  const [currentSession, setCurrentSession] = React.useState(1);
  const [isWorkPhase, setIsWorkPhase] = React.useState(true);
  const [timeLeft, setTimeLeft] = React.useState(workDuration * 60);
  const [isRunning, setIsRunning] = React.useState(true);
  const [completedSessions, setCompletedSessions] = React.useState(0);
  const [timerKey, setTimerKey] = React.useState(0);

  const [encounters, setEncounters] = React.useState([]);
  const [expGained, setExpGained] = React.useState(0);
  const [selectedMonIds, setSelectedMonIds] = React.useState([]);
  const [caughtMonIds, setCaughtMonIds] = React.useState([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const timerRef = React.useRef(null);
  const currentSessionRef = React.useRef(currentSession);
  const isWorkPhaseRef = React.useRef(isWorkPhase);

  React.useEffect(() => {
    currentSessionRef.current = currentSession;
    isWorkPhaseRef.current = isWorkPhase;
  }, [currentSession, isWorkPhase]);

  // Preload Audio on mount (does NOT autoplay)
  React.useEffect(() => {
    ensureSpawnAudio();
    ensureCaughtAudio();
  }, []);

  // Unlock audio on first user gesture (click, pointerdown, keypress) so play() won't be blocked
  React.useEffect(() => {
    function onFirstGesture() {
      try {
        unlockSpawnAudio();
        unlockCaughtAudio();
      } catch (e) {
        console.warn("[audio] unlock gesture failed", e);
      } finally {
        document.removeEventListener('pointerdown', onFirstGesture);
        document.removeEventListener('keydown', onFirstGesture);
        document.removeEventListener('click', onFirstGesture);
      }
    }
    document.addEventListener('pointerdown', onFirstGesture, { passive: true });
    document.addEventListener('keydown', onFirstGesture, { passive: true });
    document.addEventListener('click', onFirstGesture, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onFirstGesture);
      document.removeEventListener('keydown', onFirstGesture);
      document.removeEventListener('click', onFirstGesture);
    };
  }, []);

  const calculateEncounters = React.useCallback((durationMinutes, type) => {
    const totalEncounters = Math.floor(durationMinutes / 10);
    const expGain = Math.floor(durationMinutes / 30 * 100);

    const wildPokemon = [];
    for (let i = 0; i < totalEncounters; i++) {
      const wildMonData = getRandomWildPokemon(type);
      if (wildMonData) wildPokemon.push(wildMonData);
    }

    return { encounters: wildPokemon, expGain };
  }, []);

  // TIMER EFFECT
  React.useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;

          const workPhase = isWorkPhaseRef.current;
          const sessionNum = currentSessionRef.current;

          setTimeout(async () => {
            if (workPhase) {
              const { encounters, expGain } = calculateEncounters(workDuration, sessionType);

              // Spawn SFX — ensure audio is unlocked and play BEFORE navigating or changing view
              try {
                await ensureSpawnAudio();
                // don't await unlockSpawnAudio because it may hang on some browsers;
                // unlockSpawnAudio does a best-effort unmute-play; calling it is safe.
                unlockSpawnAudio();
                playSpawnSound();
              } catch (err) {
                console.warn("[audio] spawn SFX error:", err);
              }

              setEncounters(encounters);
              setExpGained(expGain);
              setSelectedMonIds([]);
              setCaughtMonIds([]);

              if (handleSessionComplete) {
                handleSessionComplete(workDuration, sessionType, true);
              }

              // Move to break if remaining sessions allow it
              // If we're on the last work session and still should show break (user expects break),
              // we allow break when sessionNum <= numSessions (so if user set numSessions=1, they still get break)
              if (sessionNum <= numSessions) {
                setIsWorkPhase(false);
                setTimeLeft(breakDuration * 60);
                setTimerKey(k => k + 1);

                // Play "caught" sound right after work ends and break starts
                try {
                  await ensureCaughtAudio();
                  unlockCaughtAudio();
                  playCaughtSound();
                } catch (err) {
                  console.warn("[audio] caught SFX error:", err);
                }
              } else {
                // fallback: go home
                setScreen("MAIN_MENU");
              }
            } else {
              // End of break — advance to next work session or finish
              if (sessionNum < numSessions) {
                setCompletedSessions(c => c + 1);
                setCurrentSession(s => s + 1);
                setIsWorkPhase(true);
                setTimeLeft(workDuration * 60);
                setEncounters([]);
                setSelectedMonIds([]);
                setCaughtMonIds([]);
                setTimerKey(k => k + 1);
              } else {
                setCompletedSessions(c => c + 1);
                setScreen("MAIN_MENU");
              }
            }
          }, 0);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [
    isRunning,
    isWorkPhase,
    timerKey,
    numSessions,
    workDuration,
    breakDuration,
    sessionType,
    calculateEncounters,
    handleSessionComplete,
    setScreen
  ]);

  const handleSkip = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const currentPhase = isWorkPhaseRef.current;
    const sessionNum = currentSessionRef.current;

    if (currentPhase) {
      const { encounters, expGain } = calculateEncounters(workDuration, sessionType);

      setEncounters(encounters);
      setExpGained(expGain);
      setSelectedMonIds([]);
      setCaughtMonIds([]);

      if (handleSessionComplete) handleSessionComplete(workDuration, sessionType, true);

      // Skip-click ALWAYS unlocks audio (user gesture) and plays spawn immediately
      try {
        unlockSpawnAudio();
        playSpawnSound();
      } catch (e) {
        console.warn("[audio] skip play failed", e);
      }

      setIsWorkPhase(false);
      setTimeLeft(breakDuration * 60);
      setTimerKey(k => k + 1);

      // Play "caught" sound right after skip moves to break
      try {
        unlockCaughtAudio();
        playCaughtSound();
      } catch (e) {
        console.warn("[audio] skip caught play failed", e);
      }
    } else {
      setCompletedSessions(c => c + 1);

      if (sessionNum < numSessions) {
        setCurrentSession(s => s + 1);
        setIsWorkPhase(true);
        setTimeLeft(workDuration * 60);
        setEncounters([]);
        setSelectedMonIds([]);
        setCaughtMonIds([]);
        setTimerKey(k => k + 1);
      } else {
        setScreen("MAIN_MENU");
      }

      // small feedback sound on skipping break too
      playSpawnSound();
    }
  };

  const handleSelectMon = index => {
    let maxSelectable = workDuration >= 40 ? 3 : workDuration >= 30 ? 2 : 1;

    if (caughtMonIds.includes(index)) return;
    if (caughtMonIds.length >= maxSelectable) return;

    setSelectedMonIds(prev =>
      prev.includes(index)
        ? prev.filter(id => id !== index)
        : prev.length < maxSelectable
          ? [...prev, index]
          : prev
    );
  };

  const handleCatchPokemon = async () => {
    if (selectedMonIds.length === 0 || isSaving) return;

    setIsSaving(true);
    const caughtNames = encounters
      .filter((_, idx) => selectedMonIds.includes(idx))
      .map(m => m.name);

    await saveCaughtPokemon(caughtNames, expGained);
    setIsSaving(false);

    setCaughtMonIds(prev => [...prev, ...selectedMonIds]);
    setSelectedMonIds([]);
  };

  const isBreak = !isWorkPhase;
  const theme = getThemeByType(sessionType);

  const headerColor = isBreak
    ? "text-green-600"
    : theme.accentColor
      ? `text-[${theme.accentColor}]`
      : "text-red-600";

  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = totalTime > 0 ? (1 - timeLeft / totalTime) * 100 : 0;

  const themeBackgroundStyle = {
    backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 text-white relative" style={themeBackgroundStyle}>
      {theme.backgroundImage && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: theme.overlay }}></div>
      )}

      <div className={style.card + " max-w-2xl w-full mt-12 relative z-10"}>

        {/* TASK NAME */}
        <h2 className="text-4xl font-bold mb-6 text-center text-white">
          {taskName}
        </h2>

        {/* GROUP INFO */}
        {isGroupSession && (
          <div className="mb-6 p-3 bg-purple-100 border-2 border-purple-500 rounded-lg text-center">
            <p className="text-purple-900 font-bold text-sm">
              🎮 Group Session with {groupSessionData?.respondentName || 'Friend'}
            </p>
            <p className="text-purple-700 text-xs mt-1">Stay focused together!</p>
          </div>
        )}

        {/* TIMER */}
        <div className="text-center mb-6">
          <div className="text-8xl font-mono font-extrabold mb-4 text-white bg-gray-900/80 p-6 rounded-lg shadow-inner border-2 border-gray-700 backdrop-blur-md">
            {formatTime(timeLeft)}
          </div>

          <p className="text-gray-200 text-xl mb-4 font-semibold">
            {isWorkPhase
              ? `Work Session ${currentSession}/${numSessions}`
              : `Break Time ${currentSession}/${numSessions}`}
          </p>

          <div className="flex justify-center items-center space-x-2 mb-4">
            {Array.from({ length: numSessions }, (_, i) => {
              const sessionNum = i + 1;
              const isDone = sessionNum <= completedSessions;
              return (
                <span key={sessionNum} className={`text-3xl ${isDone ? "text-green-400" : "text-gray-600"}`}>
                  ●
                </span>
              );
            })}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-8">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: isBreak ? "#16a34a" : theme.accentColor
            }}
          ></div>
        </div>

        {/* ENCOUNTERS DURING BREAK */}
        {isBreak && encounters.length > 0 && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border-2 border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-center text-white">
              Wild Pokémon Encounter ({encounters.length} Found)
            </h3>

            <p className="text-sm text-gray-200 mb-4 text-center">
              Select Pokémon to catch
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {encounters.map((mon, index) => {
                const isSelected = selectedMonIds.includes(index);
                const isCaught = caughtMonIds.includes(index);

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg transition-all duration-200 border-2 relative ${
                      isCaught
                        ? 'border-gray-700 bg-gray-700 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? `${getTypeBorderColor(mon.type)} ${getTypeBgColor(mon.type)} ring-4 ${getTypeRingColor(mon.type)}`
                          : `border-gray-700 bg-gray-800 ${getTypeHoverColor(mon.type)}`
                    }`}
                    onClick={() => !isCaught && handleSelectMon(index)}
                  >
                    {isCaught && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}

                    <img
                      src={getGifUrl(mon.name)}
                      alt={mon.name}
                      className="mx-auto mb-1"
                      style={{ width: "48px", height: "48px", imageRendering: "pixelated" }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = getGifUrl("Placeholder");
                      }}
                    />

                    <p className="font-semibold text-sm text-center text-white">{mon.name}</p>
                    <p className="text-xs text-gray-200 text-center">{mon.type}</p>
                  </div>
                );
              })}
            </div>

            {selectedMonIds.length > 0 && (
              <button
                className={style.button + " bg-green-600 text-white hover:bg-green-700 w-full"}
                onClick={handleCatchPokemon}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : `Catch ${selectedMonIds.length} Pokémon`}
              </button>
            )}
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex justify-center space-x-4">
          <button
            className={`${style.button} ${style.secondaryButton}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "Pause" : "Resume"}
          </button>

          <button
            className={style.button + " bg-yellow-500 text-gray-900 hover:bg-yellow-600"}
            onClick={handleSkip}
          >
            Skip Session
          </button>

          <button
            className={style.button + " bg-red-600 text-white hover:bg-red-700"}
            onClick={() => setScreen("MAIN_MENU")}
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
}
