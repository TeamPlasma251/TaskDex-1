import React, { useState, useRef } from 'react';
import { POKEMON_DATA } from '../data/pokemonData.js';
import { getTypeHoverColor, getTypeBorderColor, getTypeBgColor, getTypeRingColor } from '../utils/typeColors.js';
import { getGifUrl } from '../utils/sprites.js';

const style = {
  card: "bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300",
  button: "px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-md",
  primaryButton: "bg-red-600 text-white hover:bg-red-700",
  secondaryButton: "bg-gray-600 text-white hover:bg-gray-700",
  input: "w-full p-3 rounded-lg bg-white border-2 border-gray-300 text-black focus:border-red-500 focus:ring-2 focus:ring-red-500",
};

// Task Start Modal Component
function TaskStartModal({ task, onStart, onCancel, getTypeButtonColor }) {
  const [workDuration, setWorkDuration] = React.useState(30);
  const [breakDuration, setBreakDuration] = React.useState(5);
  const [numSessions, setNumSessions] = React.useState(4);

  const handleStart = () => {
    if (workDuration >= 20 && breakDuration >= 1 && numSessions >= 1) {
      onStart(workDuration, breakDuration, numSessions);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4 border-2 border-gray-300">
        <h3 className="text-3xl font-bold mb-4 text-black text-center">{task.name}</h3>
        <div className="mb-4 text-center">
          <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getTypeButtonColor(task.type)}`}>
            {task.type}
          </span>
        </div>
        {task.description && (
          <p className="text-gray-700 mb-6 text-center">{task.description}</p>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Work Duration (minutes) - Minimum 20:
            </label>
            <input
              type="number"
              value={workDuration}
              onChange={(e) => setWorkDuration(Math.max(20, parseInt(e.target.value) || 20))}
              className={style.input}
              min="20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Break Duration (minutes) - Minimum 1:
            </label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className={style.input}
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Sessions - Minimum 1:
            </label>
            <input
              type="number"
              value={numSessions}
              onChange={(e) => setNumSessions(Math.max(1, parseInt(e.target.value) || 1))}
              className={style.input}
              min="1"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            className={style.button + " " + style.primaryButton + " flex-1"}
            onClick={handleStart}
            disabled={workDuration < 20 || breakDuration < 1 || numSessions < 1}
          >
            Start Task
          </button>
          <button
            className={style.button + " " + style.secondaryButton + " flex-1"}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksScreen({ setScreen, userData, tasks, setTasks, setSessionConfig }) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('Psychic');
  const [taskDescription, setTaskDescription] = useState('');
  const [clickedTaskId, setClickedTaskId] = useState(null);
  const [newTaskId, setNewTaskId] = useState(null);
  const ariaLiveRef = useRef(null);
  
  // Show welcome message only once per session (after login)
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    return !hasSeenWelcome;
  });
  
  // Welcome message stays until user dismisses it
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  const announceToScreenReader = (message) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message;
      setTimeout(() => {
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  const handleSaveTask = () => {
    if (!taskName.trim()) return;
    
    const newTask = {
      id: crypto.randomUUID(),
      name: taskName,
      type: taskType,
      description: taskDescription,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    
    setNewTaskId(newTask.id);
    const updatedTasks = [...(tasks || []), newTask];
    setTasks(updatedTasks);
    
    // Announce to screen readers
    announceToScreenReader(`Task "${taskName}" added successfully`);
    
    // Reset form
    setTaskName('');
    setTaskType('Psychic');
    setTaskDescription('');
    setShowAddTask(false);
    
    // Clear animation class after animation completes
    setTimeout(() => setNewTaskId(null), 300);
  };

  const handleStartTask = (task, workDuration, breakDuration, numSessions) => {
    setSessionConfig({ 
      type: task.type, 
      studyTime: workDuration, 
      restTime: breakDuration,
      taskId: task.id,
      taskName: task.name,
      numSessions: numSessions
    });
    setSelectedTask(null);
    announceToScreenReader(`Starting task: ${task.name}`);
    setScreen('POMODORO_RUNNING');
  };

  const handleTaskClick = (task, event) => {
    setClickedTaskId(task.id);
    
    // Add particle burst effect
    const card = event.currentTarget;
    card.classList.add('particle-burst');
    setTimeout(() => {
      card.classList.remove('particle-burst');
    }, 400);
    
    setTimeout(() => {
      setClickedTaskId(null);
      setSelectedTask(task);
    }, 300);
  };

  const handleTaskKeyDown = (e, task) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskClick(task, e);
    }
  };

  // Get a Pokémon sprite for decoration based on task type
  const getTaskSpriteUrl = (type) => {
    // Map types to example Pokémon names
    const typeMap = {
      'Grass': 'Bulbasaur',
      'Fire': 'Charmander',
      'Water': 'Squirtle',
      'Psychic': 'Mewtwo',
      'Ghost': 'Gastly',
      'Electric': 'Pikachu',
    };
    const pokemonName = typeMap[type] || 'Pikachu';
    return getGifUrl(pokemonName);
  };

  const getTypeButtonColor = (type) => {
    const colors = {
      'Grass': 'bg-green-600 text-white',
      'Fire': 'bg-red-600 text-white',
      'Water': 'bg-blue-600 text-white',
      'Psychic': 'bg-pink-400 text-white',
      'Ghost': 'bg-blue-900 text-white',
      'Electric': 'bg-yellow-500 text-black',
    };
    return colors[type] || 'bg-gray-600 text-white';
  };

  const trainerName = userData?.trainerName || 'Trainer';
  const firstPokemon = userData?.pokemon_inventory.find(p => p.isPartner)?.currentName || 'N/A';

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-[#f5f5dc] text-black">
      {/* ARIA Live Region for Screen Reader Announcements */}
      <div 
        ref={ariaLiveRef}
        className="aria-live-region" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      
      <div className={style.card + " max-w-4xl w-full mt-8"}>
        {/* Welcome Message - Shows once after login */}
        {showWelcome && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">Welcome Back, {trainerName}!</h3>
                <p className="text-gray-700">
                  Your partner, <span className="font-semibold text-green-600">{firstPokemon}</span>, is ready to help you focus.
                </p>
              </div>
              <button
                onClick={handleDismissWelcome}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-black">My Tasks</h2>
          <button
            className={`${style.button} ${style.primaryButton} text-lg px-8 py-4 focus-ring hover-lift`}
            onClick={() => setShowAddTask(true)}
            aria-label="Add new task"
          >
            + Add Task
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4" role="list" aria-label="Task list">
          {(!tasks || tasks.length === 0) ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg border-2 border-gray-300" role="status">
              <p className="text-gray-600 text-lg">No tasks yet. Click "Add Task" to create your first task!</p>
            </div>
          ) : (
            tasks.map(task => {
              const typeHoverClass = getTypeHoverColor(task.type);
              const typeBorderClass = getTypeBorderColor(task.type);
              const typeBgClass = getTypeBgColor(task.type);
              const typeRingClass = getTypeRingColor(task.type);
              const spriteUrl = getTaskSpriteUrl(task.type);
              
              return (
                <div
                  key={task.id}
                  role="listitem"
                  tabIndex={0}
                  className={`pokemon-card p-6 rounded-xl border-2 cursor-pointer focus-ring hover-lift ${typeBorderClass} bg-white ${typeHoverClass} hover:ring-4 ${typeRingClass} hover:shadow-xl ${
                    clickedTaskId === task.id ? 'pokeball-click' : ''
                  } ${newTaskId === task.id ? 'task-add-animation' : ''}`}
                  onClick={(e) => handleTaskClick(task, e)}
                  onKeyDown={(e) => handleTaskKeyDown(e, task)}
                  aria-label={`Task: ${task.name}, Type: ${task.type}. ${task.description ? `Description: ${task.description}` : ''} Click to start task.`}
                  style={{
                    '--pokemon-sprite-url': `url(${spriteUrl})`
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getTypeButtonColor(task.type)}`}>
                          {task.type}
                        </span>
                        <h3 className="text-2xl font-bold text-black">{task.name}</h3>
                      </div>
                      {task.description && (
                        <p className="text-gray-700 mt-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full mx-4 border-2 border-gray-300">
            <h3 className="text-3xl font-bold mb-6 text-black">Add New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name:</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name..."
                  className={style.input}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Type:</label>
                <div className="grid grid-cols-3 gap-2">
                  {POKEMON_DATA.SESSION_TYPES.map(type => (
                    <button
                      key={type}
                      className={`py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
                        taskType === type
                          ? `${getTypeButtonColor(type)} border-black shadow-lg scale-105`
                          : 'bg-gray-100 hover:bg-gray-200 text-black border-gray-300'
                      }`}
                      onClick={() => setTaskType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe your task..."
                  rows={4}
                  className={style.input + " resize-none"}
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                className={style.button + " " + style.primaryButton + " flex-1"}
                onClick={handleSaveTask}
                disabled={!taskName.trim()}
              >
                Save Task
              </button>
              <button
                className={style.button + " " + style.secondaryButton + " flex-1"}
                onClick={() => {
                  setShowAddTask(false);
                  setTaskName('');
                  setTaskType('Psychic');
                  setTaskDescription('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Task Modal */}
      {selectedTask && (
        <TaskStartModal 
          task={selectedTask}
          onStart={(workDuration, breakDuration, numSessions) => handleStartTask(selectedTask, workDuration, breakDuration, numSessions)}
          onCancel={() => setSelectedTask(null)}
          getTypeButtonColor={getTypeButtonColor}
        />
      )}
    </div>
  );
}

