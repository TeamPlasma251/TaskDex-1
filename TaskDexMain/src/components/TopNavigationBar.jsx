import React, { useState } from 'react';
import { getGifUrl } from '../utils/sprites.js';
import { getTypeBorderColor } from '../utils/typeColors.js';
import { getPokemonDataByName } from '../data/pokemonData.js';

export default function TopNavigationBar({ setScreen, userData, currentScreen }) {
  const trainerSprite = userData?.trainerGender === 'male' ? 'TrainerMale' : 'TrainerFemale';
  const partner = userData?.pokemon_inventory.find(p => p.isPartner);
  const [clickedButton, setClickedButton] = useState(null);
  
  // Check if partner is ready to evolve
  const partnerData = partner ? getPokemonDataByName(partner.currentName) : null;
  const isReadyToEvolve = partner && partnerData && partnerData.evoExp !== -1 && partner.exp >= partnerData.evoExp;
  
  const navItems = [
    { name: "My Tasks", screen: 'TASKS_SCREEN', ariaLabel: 'Navigate to My Tasks screen' },
    { name: "Pokédex", screen: 'POKEDEX_VIEW', ariaLabel: 'Navigate to Pokédex screen' },
    { name: "Friends", screen: 'FRIENDS_LIST', ariaLabel: 'Navigate to Friends screen' },
    { name: "Achievements", screen: 'ACHIEVEMENTS_VIEW', ariaLabel: 'Navigate to Achievements screen' },
  ];

  // Don't show navigation on these screens
  const hideNavScreens = ['WELCOME', 'LOGIN_SIGNUP', 'STARTER_SELECT', 'POMODORO_RUNNING', 'ENCOUNTER_SCREEN', 'POMODORO_SETUP'];
  if (hideNavScreens.includes(currentScreen) || !userData) {
    return null;
  }

  const handleNavClick = (screen, itemName) => {
    setClickedButton(screen);
    setTimeout(() => {
      setClickedButton(null);
      setScreen(screen);
    }, 300);
  };

  const handlePartnerClick = () => {
    setClickedButton('partner');
    setTimeout(() => {
      setClickedButton(null);
      setScreen('PARTNER_SELECT_SCREEN');
    }, 300);
  };

  return (
    <>
      {/* ARIA Live Region for Screen Reader Announcements */}
      <div className="aria-live-region" aria-live="polite" aria-atomic="true" id="nav-announcements"></div>
      
      <nav className="nav-black-theme shadow-lg sticky top-0 z-40" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - refined logo pill */}
            <div className="flex items-center">
              <button
                onClick={() => setScreen('MAIN_MENU')}
                className="logo-pill flex items-center gap-3 px-3 py-1 rounded-full focus-ring"
                aria-label="Open Main Menu"
                title="TaskDex Home"
              >
                <div className="logo-mark rounded-full flex items-center justify-center">
                  <span className="logo-letter">T</span>
                </div>
                <div className="logo-text leading-tight text-left">
                  <div className="site-title text-white font-semibold">TaskDex</div>
                  <div className="site-tagline text-gray-300 text-xs">Organize • Level Up</div>
                </div>
              </button>
            </div>

            {/* Center - Navigation Items */}
            <div className="flex items-center space-x-2" role="menubar">
              {navItems.map((item) => (
                <button
                  key={item.screen}
                  onClick={() => handleNavClick(item.screen, item.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavClick(item.screen, item.name);
                    }
                  }}
                  className={`nav-button px-4 py-2 rounded-lg font-semibold nav-font-times focus-ring ${
                    currentScreen === item.screen
                      ? 'active'
                      : ''
                  } ${clickedButton === item.screen ? 'pokeball-click' : ''}`}
                  aria-label={item.ariaLabel}
                  aria-current={currentScreen === item.screen ? 'page' : undefined}
                  role="menuitem"
                >
                  <span className="text-sm">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Right side - compact profile panel (trainer + partner) */}
            <div className="flex items-center">
              <div className="top-right-panel flex items-center space-x-3 px-2 py-1 rounded-full transition-all">
                {/* Trainer Profile Compact Button */}
                <button
                  onClick={handlePartnerClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePartnerClick();
                    }
                  }}
                  className={`profile-button flex items-center gap-3 pl-2 pr-3 py-1 rounded-full bg-transparent focus-ring ${
                    clickedButton === 'trainer' ? 'pokeball-click' : ''
                  }`}
                  aria-label="Open partner selection screen"
                  title="View Partner Selection"
                >
                  <div className="sprite-ring rounded-full p-0.5 flex items-center justify-center">
                    <img
                      src={getGifUrl(trainerSprite)}
                      alt="Trainer Profile"
                      style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl('Placeholder'); }}
                      className="rounded-full"
                    />
                  </div>

                  <div className="profile-info text-left">
                    <div className="profile-name text-white font-semibold text-sm">{userData?.trainerName || 'Trainer'}</div>
                    <div className="profile-sub text-gray-300 text-xs">{partner ? partner.currentName : 'No Partner'}</div>
                  </div>

                  <div className="chev text-white opacity-80">›</div>

                  {/* Evolution notification tucked into the profile */}
                  {isReadyToEvolve && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse border-2 border-white" aria-label="Partner ready to evolve">
                      !
                    </span>
                  )}
                </button>

                {/* Partner Sprite Accent */}
                {partner && (
                  <button
                    onClick={handlePartnerClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePartnerClick();
                      }
                    }}
                    className={`partner-sprite-active rounded-full p-1 ${getTypeBorderColor(partner.type)} focus-ring transition-transform hover-lift ${
                      clickedButton === 'partner' ? 'pokeball-click' : ''
                    }`}
                    aria-label={`Active partner: ${partner.currentName}. Click to change partner.`}
                    title={`Partner: ${partner.currentName}`}
                  >
                    <div className="partner-ring rounded-full p-0.5">
                      <img
                        src={getGifUrl(partner.currentName)}
                        alt={`Partner ${partner.currentName}`}
                        style={{ width: '44px', height: '44px', imageRendering: 'pixelated' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = getGifUrl('Placeholder'); }}
                        className="rounded-full"
                      />
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

