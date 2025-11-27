import React, { useState } from 'react';

interface PlayfulButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'highlight' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export function PlayfulButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}: PlayfulButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantStyles = {
    primary: 'bg-gradient-to-br from-[#4D96FF] to-[#3B7FE8] hover:from-[#5BA5FF] hover:to-[#4D96FF]',
    secondary: 'bg-gradient-to-br from-[#6BCB77] to-[#5BB967] hover:from-[#7BD587] hover:to-[#6BCB77]',
    highlight: 'bg-gradient-to-br from-[#FFD93D] to-[#FFC72D] hover:from-[#FFE34D] hover:to-[#FFD93D]',
    danger: 'bg-gradient-to-br from-[#FF6B6B] to-[#E85B5B] hover:from-[#FF7B7B] hover:to-[#FF6B6B]',
  };

  const sizeStyles = {
    small: 'px-4 py-2 text-sm rounded-2xl',
    medium: 'px-8 py-4 text-lg rounded-3xl',
    large: 'px-12 py-6 text-2xl rounded-[2rem]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        text-white
        shadow-lg
        transform
        transition-all
        duration-150
        active:scale-95
        hover:scale-105
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        ${isPressed ? 'scale-95' : ''}
        ${className}
      `}
      style={{
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      {children}
    </button>
  );
}
