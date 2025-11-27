import React from 'react';

interface CountdownNumberProps {
  number: number | 'GO!';
}

export function CountdownNumber({ number }: CountdownNumberProps) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];
  const colorIndex = typeof number === 'number' ? number % colors.length : 3;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="animate-pop"
        style={{
          fontSize: '12rem',
          fontWeight: 900,
          color: colors[colorIndex],
          textShadow: `
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px ${colors[colorIndex]},
            8px 8px 0 rgba(0, 0, 0, 0.2)
          `,
          WebkitTextStroke: '8px white',
          paintOrder: 'stroke fill',
        }}
      >
        {number}
      </div>
    </div>
  );
}
