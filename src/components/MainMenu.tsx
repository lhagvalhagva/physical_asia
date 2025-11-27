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
      className="min-h-screen flex flex-col items-center justify-center p-8 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="text-center mb-6 md:mb-12">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-2 md:mb-4 px-4"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-5xl">
        <div
          className="bg-white rounded-[2rem] p-3 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
          onClick={() => onSelectGame('rope')}
          style={{
            border: '6px solid red',
          }}
        >
          <div className="w-full h-48 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={tugofwarImage} 
              alt="Tug of War" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div
          className="bg-white rounded-[2rem] p-3 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
          onClick={() => onSelectGame('balloon')}
          style={{
            border: '6px solid red',
          }}
        >
          <div className="w-full h-48 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={waterballoonImage} 
              alt="Water Balloon" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div
          className="bg-white rounded-[2rem] p-3 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
          onClick={() => onSelectGame('cargo')}
          style={{
            border: '6px solid red',
          }}
        >
          <div className="w-full h-48 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={cargopushImage} 
              alt="Cargo Push" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto items-stretch sm:items-center px-4 sm:px-0">
        {onStartMatchmaking && (
          <button
            onClick={onStartMatchmaking}
            className="px-4 py-3 sm:px-8 sm:py-4 md:px-12 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-lg transform transition-all duration-150 active:scale-95 hover:scale-105 font-bold w-full sm:w-auto"
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
          className="px-4 py-3 sm:px-8 sm:py-4 md:px-12 md:py-6 text-base sm:text-lg md:text-xl lg:text-2xl rounded-xl sm:rounded-2xl md:rounded-[2rem] shadow-lg transform transition-all duration-150 active:scale-95 hover:scale-105 font-bold w-full sm:w-auto"
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
