import React, { useEffect, useState } from 'react';

export default function WelcomeScreen({ setScreen }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "Task-Based Maps",
      description: "Assign Pokémon-style maps to your tasks to customize your journey."
    },
    {
      title: "Partner Pokémon",
      description: "Choose a partner Pokémon to accompany you during your Pomodoro sessions."
    },
    {
      title: "Encounter & Collect",
      description: "Discover and catch new Pokémon during your breaks. Can you collect them all?"
    },
    {
      title: "Level Up",
      description: "Stay productive to level up your partner Pokémon and unlock new potentials."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5dc] overflow-x-hidden">
      {/* Header/Navigation */}
      <header className={`bg-transparent text-black px-6 py-6 flex justify-between items-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center space-x-3">
          {/* Logo - Red circle with white T */}
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center nav-font-jersey">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-xl font-bold text-black nav-font-jersey">TaskDex</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setScreen('LOGIN_SIGNUP')}
            className="text-black hover:text-gray-700 transition-colors duration-200 welcome-body-text font-medium"
          >
            Sign In
          </button>
          <button
            onClick={() => setScreen('LOGIN_SIGNUP')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 welcome-body-text"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight welcome-text-smooth ${isVisible ? 'text-reveal' : 'opacity-0'}`}>
              Focus. Capture. Evolve.
            </h1>
            <p className={`text-xl md:text-2xl text-gray-700 leading-relaxed welcome-body-text ${isVisible ? 'text-reveal-delay-1' : 'opacity-0'}`}>
              Every Pomodoro session is a step forward in your Pokémon adventure.
            </p>
            <button
              onClick={() => setScreen('LOGIN_SIGNUP')}
              className={`bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg welcome-body-text ${isVisible ? 'text-reveal-delay-2' : 'opacity-0'}`}
            >
              Start Your Journey
            </button>
          </div>

          {/* Right Column - Image */}
          <div className={`relative flex justify-center items-center ${isVisible ? 'welcome-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <img 
              src="https://i.pinimg.com/736x/0e/68/54/0e6854db8449efa705847012d9bcc03c.jpg"
              alt="Ash and Pikachu"
              className="max-w-full h-auto rounded-2xl shadow-2xl"
              style={{
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-12">
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-200 hover:border-red-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${isVisible ? 'welcome-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black mb-2 welcome-text-smooth">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed welcome-body-text">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
