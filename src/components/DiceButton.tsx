import React, { useState } from 'react';
import { Dices, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceButtonProps {
  onRoll: (result: number) => void;
  disabled?: boolean;
  isActive?: boolean;
}

const DICE_ICONS: { [key: number]: React.ElementType } = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
};

export function DiceButton({ onRoll, disabled = false, isActive = false }: DiceButtonProps) {
  const [isRolling, setIsRolling] = useState(false);
  // Одоо харагдаж буй шооны нүд (null үед default icon харагдана)
  const [currentFace, setCurrentFace] = useState<number | null>(null);

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    
    let count = 0;
    const interval = setInterval(() => {
      count++;
      // Эргэлдэж байх үед санамсаргүй нүдийг харуулна (Visual effect)
      const randomFace = Math.floor(Math.random() * 6) + 1;
      setCurrentFace(randomFace);

      if (count > 10) { // Энд хугацааг тохируулж болно
        clearInterval(interval);
        
        // Эцсийн үр дүн
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setCurrentFace(finalResult); // Эцсийн дүрсийг харуулах
        onRoll(finalResult);
        setIsRolling(false);
      }
    }, 100); // 100ms тутамд шооны нүд солигдоно
  };

  // Одоо харуулах Icon-оо сонгох
  const CurrentIcon = currentFace ? DICE_ICONS[currentFace] : Dices;

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
        flex flex-col items-center justify-center
        ${isRolling ? 'animate-shake' : ''} 
        ${isActive ? 'ring-4 ring-[#FFD93D] ring-offset-4 animate-pulse' : ''}
      `}
      style={{
        border: '6px solid white',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -6px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Icon-г динамикаар солино */}
      <CurrentIcon 
        className={`text-[#4D96FF] w-16 h-16 transition-all duration-75 ${isRolling ? 'opacity-80' : 'opacity-100'}`} 
        strokeWidth={3} 
      />
      
      <div className="text-xs mt-2 text-gray-700 font-bold">
        {isRolling ? (
          <span className="flex items-center gap-1 text-indigo-600">
            <span className="animate-spin">🎲</span>
            <span>Эргэж байна...</span>
          </span>
        ) : currentFace ? (
          <span className="flex items-center gap-1 text-green-600">
            <span>✅</span>
            <span>Үр дүн: {currentFace}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span>🎲</span>
            <span>Шоо шидэх</span>
          </span>
        )}
      </div>
      
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6BCB77] rounded-full animate-ping" />
      )}
    </button>
  );
}