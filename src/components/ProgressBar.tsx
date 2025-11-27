import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = '#4D96FF', height = 24 }: ProgressBarProps) {
  return (
    <div
      className="w-full bg-white rounded-full shadow-inner overflow-hidden"
      style={{
        height: `${height}px`,
        border: '3px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `0 0 10px ${color}88`,
        }}
      />
    </div>
  );
}
