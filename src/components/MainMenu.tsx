import React from 'react';
import { PlayfulButton } from './PlayfulButton';
import cargopushImage from '../assets/images/games/cargopush.png';
import tugofwarImage from '../assets/images/games/tugofwar.png';
import waterballoonImage from '../assets/images/games/waterballoon.png';
import backgroundImage from '../assets/images/background.png';

interface MainMenuProps {
  onSelectGame: (game: 'rope' | 'balloon' | 'cargo') => void;
  onShowLeaderboard: () => void;
}

export function MainMenu({ onSelectGame, onShowLeaderboard }: MainMenuProps) {
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
      <div className="text-center mb-12">
        <h1
          className="text-8xl mb-4"
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
            border: '6px solid rgba(255, 107, 107, 0.3)',
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
            border: '6px solid rgba(77, 150, 255, 0.3)',
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
            border: '6px solid rgba(107, 203, 119, 0.3)',
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

      <div className="flex gap-4">
        <button
          onClick={onShowLeaderboard}
          className="px-12 py-6 text-2xl rounded-[2rem] bg-white text-red-600 shadow-lg transform transition-all duration-150 active:scale-95 hover:scale-105 hover:bg-red-600 hover:text-white font-bold"
          style={{
            border: '4px solid #FF0000',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          Ялагчийн самбар
        </button>
      </div>
    </div>
  );
}
