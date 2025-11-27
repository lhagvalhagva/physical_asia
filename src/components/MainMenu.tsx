import React, { useState } from 'react';
import { PlayfulButton } from './PlayfulButton';
import cargopushImage from '../assets/images/games/cargopush.png';
import tugofwarImage from '../assets/images/games/tugofwar.png';
import waterballoonImage from '../assets/images/games/waterballoon.png';
import backgroundImage from '../assets/images/background.png';

interface MainMenuProps {
  onSelectGame: (game: 'rope' | 'balloon' | 'cargo') => void;
  onShowLeaderboard: () => void;
  onStartMatchmaking?: () => void;
}

export function MainMenu({ onSelectGame, onShowLeaderboard, onStartMatchmaking }: MainMenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-2 sm:mb-3 md:mb-4"
          style={{
            fontFamily: "'Arial Black', 'Impact', 'Oswald', 'Roboto', sans-serif",
            fontWeight: '900',
            letterSpacing: '0.05em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span style={{ color: '#FFFFFF' }}>Physical </span>
          <span style={{ color: '#FF0000' }}>ARDs</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12 w-full max-w-5xl px-4">
        <div
          className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl transform transition-all duration-300 active:scale-95 sm:hover:scale-105 cursor-pointer overflow-hidden touch-manipulation"
          onClick={() => onSelectGame('rope')}
          style={{
            border: '3px solid red',
          }}
        >
          <div className="w-full h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={tugofwarImage} 
              alt="Tug of War" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div
          className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl transform transition-all duration-300 active:scale-95 sm:hover:scale-105 cursor-pointer overflow-hidden touch-manipulation"
          onClick={() => onSelectGame('balloon')}
          style={{
            border: '3px solid red',
          }}
        >
          <div className="w-full h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={waterballoonImage} 
              alt="Water Balloon" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div
          className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl transform transition-all duration-300 active:scale-95 sm:hover:scale-105 cursor-pointer overflow-hidden touch-manipulation"
          onClick={() => onSelectGame('cargo')}
          style={{
            border: '3px solid red',
          }}
        >
          <div className="w-full h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={cargopushImage} 
              alt="Cargo Push" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-4">
        {onStartMatchmaking && (
          <button
            onClick={onStartMatchmaking}
            className="px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl rounded-xl sm:rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 hover:scale-105 font-bold touch-manipulation"
            style={{
              backgroundColor: '#4D96FF',
              color: '#FFFFFF',
              border: '3px solid #3B7FE8',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            🎮 Matchmaking
          </button>
        )}
        <button
          onClick={onShowLeaderboard}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl rounded-xl sm:rounded-2xl shadow-lg transform transition-all duration-150 active:scale-95 hover:scale-105 font-bold touch-manipulation"
          style={{
            backgroundColor: isHovered ? '#FF0000' : '#FFFFFF',
            color: isHovered ? '#FFFFFF' : '#000000',
            border: '3px solid #FF0000',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          Ялагчийн самбар
        </button>
      </div>
    </div>
  );
}
