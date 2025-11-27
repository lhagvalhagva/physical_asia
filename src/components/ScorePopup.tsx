import React from 'react';

interface ScorePopupProps {
  score: number;
  position: { x: number; y: number };
}

export function ScorePopup({ score, position }: ScorePopupProps) {
  return (
    <div
      className="fixed pointer-events-none animate-pop z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="px-6 py-3 rounded-2xl text-white text-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
          border: '4px solid white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        +{score}
      </div>
    </div>
  );
}
