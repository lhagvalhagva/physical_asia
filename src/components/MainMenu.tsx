import React from 'react';
import { PlayfulButton } from './PlayfulButton';
import { Sparkles, Droplet, Package } from 'lucide-react';

interface MainMenuProps {
  onSelectGame: (game: 'rope' | 'balloon' | 'cargo') => void;
  onShowLeaderboard: () => void;
}

export function MainMenu({ onSelectGame, onShowLeaderboard }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12 animate-float">
        <h1
          className="text-8xl mb-4"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 33%, #6BCB77 66%, #4D96FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          🎮 Party Games 🎮
        </h1>
        <p className="text-xl text-gray-700">Choose your challenge!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-5xl">
        <div
          className="bg-white rounded-[2rem] p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onSelectGame('rope')}
          style={{
            border: '6px solid rgba(255, 107, 107, 0.3)',
          }}
        >
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#E85B5B] w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="text-white" size={48} />
          </div>
          <h2 className="text-center text-[#FF6B6B] mb-2">Tug of War</h2>
          <p className="text-center text-gray-600 text-sm">
            Click fast to pull the rope! First to the edge wins!
          </p>
        </div>

        <div
          className="bg-white rounded-[2rem] p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onSelectGame('balloon')}
          style={{
            border: '6px solid rgba(77, 150, 255, 0.3)',
          }}
        >
          <div className="bg-gradient-to-br from-[#4D96FF] to-[#3B7FE8] w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Droplet className="text-white" size={48} />
          </div>
          <h2 className="text-center text-[#4D96FF] mb-2">Water Balloon</h2>
          <p className="text-center text-gray-600 text-sm">
            Fill your balloon faster! Don't let it burst!
          </p>
        </div>

        <div
          className="bg-white rounded-[2rem] p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => onSelectGame('cargo')}
          style={{
            border: '6px solid rgba(107, 203, 119, 0.3)',
          }}
        >
          <div className="bg-gradient-to-br from-[#6BCB77] to-[#5BB967] w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package className="text-white" size={48} />
          </div>
          <h2 className="text-center text-[#6BCB77] mb-2">Cargo Push</h2>
          <p className="text-center text-gray-600 text-sm">
            Race to push your cargo to the finish line!
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <PlayfulButton onClick={onShowLeaderboard} variant="highlight" size="large">
          🏆 Leaderboard
        </PlayfulButton>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600">
          🎯 Multiplayer Fun • 2-4 Players • Click & Compete! 🎯
        </p>
      </div>
    </div>
  );
}
