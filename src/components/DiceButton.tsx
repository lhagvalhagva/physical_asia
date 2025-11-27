import React, { useState } from 'react';
import { Dices } from 'lucide-react';

interface DiceButtonProps {
  onRoll: (result: number) => void;
  disabled?: boolean;
  isActive?: boolean;
}

export function DiceButton({ onRoll, disabled = false, isActive = false }: DiceButtonProps) {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    
    // Simulate rolling animation
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count > 10) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 6) + 1;
        onRoll(result);
        setIsRolling(false);
      }
    }, 100);
  };

  return (
    <button
      onClick={handleRoll}
      disabled={disabled || isRolling}
      className={`
        relative
        w-32
        h-32
        rounded-3xl
        bg-gradient-to-br
        from-white
        to-gray-100
        shadow-2xl
        transform
        transition-all
        duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        hover:scale-110
        active:scale-95
        ${isRolling ? 'animate-shake' : ''}
        ${isActive ? 'ring-4 ring-[#FFD93D] ring-offset-4 animate-pulse' : ''}
      `}
      style={{
        border: '6px solid white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -6px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Dices className="text-[#4D96FF] w-16 h-16 mx-auto" strokeWidth={3} />
      <div className="text-xs mt-2 text-gray-600">ROLL</div>
      
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6BCB77] rounded-full animate-ping" />
      )}
    </button>
  );
}
