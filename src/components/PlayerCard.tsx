import React from 'react';
import { User } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  score: number;
  avatarColor: string;
  status: 'active' | 'waiting' | 'offline';
  isMe?: boolean;
  size?: 'small' | 'large';
}

export function PlayerCard({ name, score, avatarColor, status, isMe = false, size = 'small' }: PlayerCardProps) {
  const statusStyles = {
    active: 'ring-4 ring-[#6BCB77] ring-offset-4',
    waiting: 'ring-2 ring-[#FFD93D] ring-offset-2',
    offline: 'opacity-50 ring-2 ring-gray-400 ring-offset-2',
  };

  const sizeStyles = {
    small: 'p-3',
    large: 'p-6',
  };

  const avatarSizeStyles = {
    small: 'w-12 h-12',
    large: 'w-24 h-24',
  };

  const textSizeStyles = {
    small: 'text-sm',
    large: 'text-xl',
  };

  return (
    <div
      className={`
        relative
        bg-white
        rounded-3xl
        shadow-xl
        transform
        transition-all
        duration-300
        ${sizeStyles[size]}
        ${statusStyles[status]}
        ${status === 'active' ? 'animate-pulse' : ''}
      `}
      style={{
        border: '4px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      }}
    >
      {isMe && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] text-white px-4 py-1 rounded-full text-xs shadow-lg">
          YOU
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <div
          className={`
            ${avatarSizeStyles[size]}
            rounded-full
            flex
            items-center
            justify-center
            shadow-lg
          `}
          style={{
            background: avatarColor,
            border: '3px solid white',
          }}
        >
          <User className="text-white" size={size === 'small' ? 24 : 48} />
        </div>
        
        <div className="flex-1">
          <div className={`font-bold text-gray-800 ${textSizeStyles[size]}`}>{name}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-gray-600 ${textSizeStyles[size]}`}>Score:</span>
            <span
              className={`font-bold ${textSizeStyles[size]}`}
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
