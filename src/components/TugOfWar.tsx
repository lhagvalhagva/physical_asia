import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PlayfulButton } from './PlayfulButton';
import { PlayerCard } from './PlayerCard';
import { TopBar } from './TopBar';
import { CountdownNumber } from './CountdownNumber';
import { ProgressBar } from './ProgressBar';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  position: number; // -50 to 50
}

interface TugOfWarProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function TugOfWar({ players, onGameEnd, onHome, onLeaderboard }: TugOfWarProps) {
  const [countdown, setCountdown] = useState<number | 'GO!' | null>(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [totemBalance, setTotemBalance] = useState(0); // -50 to 50, 0 = balanced
  const [timeLeft, setTimeLeft] = useState(60);
  const totemRef = useRef<THREE.Group>(null);

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;

    if (typeof countdown === 'number' && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setCountdown('GO!');
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 'GO!') {
      const timer = setTimeout(() => {
        setCountdown(null);
        setGameStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Hold time counter
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setHoldTime((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [gameStarted]);

  // Three.js totem animation
  useEffect(() => {
    if (!gameStarted || !totemRef.current) return;

    const animate = () => {
      if (totemRef.current) {
        // Totem tilt based on balance
        const tiltAngle = (totemBalance / 50) * Math.PI / 6; // Max 30 degrees
        totemRef.current.rotation.z = tiltAngle;
        
        // Slight shake when unbalanced
        if (Math.abs(totemBalance) > 30) {
          totemRef.current.rotation.x = Math.sin(Date.now() * 0.01) * 0.05;
          totemRef.current.rotation.y = Math.cos(Date.now() * 0.01) * 0.05;
        }
      }
    };

    const interval = setInterval(animate, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameStarted, totemBalance]);

  // Natural balance drift and opponent effects
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      // Natural drift towards imbalance
      const drift = (Math.random() - 0.5) * 0.8;
      // Opponent effects
      const opponentEffect = Math.random() * 0.6;
      
      setTotemBalance((prev) => {
        const newBalance = Math.max(-50, Math.min(50, prev + drift + opponentEffect));
        // Game over if too unbalanced
        if (Math.abs(newBalance) >= 50) {
          endGame();
        }
        return newBalance;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleBalance = () => {
    if (!gameStarted) return;

    // Player action to balance the totem
    setTotemBalance((prev) => {
      const correction = prev > 0 ? -2 : 2;
      return Math.max(-50, Math.min(50, prev + correction));
    });
  };

  const endGame = () => {
    setGameStarted(false);
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === 0 
        ? Math.floor(holdTime * 10) + (Math.abs(totemBalance) < 10 ? 500 : 0)
        : Math.floor(Math.random() * 1200),
    }));
    setTimeout(() => onGameEnd(updatedPlayers), 1000);
  };

  const otherPlayers = players.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="🗿 Stone Totem Endurance"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
      />

      {countdown !== null && <CountdownNumber number={countdown} />}

      <div className="flex-1 flex flex-col p-2 md:p-4">
        {/* Other players - Compact */}
        <div className={`mb-2 ${otherPlayers.length === 3 ? 'grid grid-cols-3 gap-2' : otherPlayers.length === 2 ? 'grid grid-cols-2 gap-2' : ''}`}>
          {otherPlayers.map((player) => (
            <PlayerCard
              key={player.name}
              name={player.name}
              score={player.score}
              avatarColor={player.avatarColor}
              status="waiting"
              size="small"
            />
          ))}
        </div>

        {/* Game Area - Canvas takes most space */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Three.js Stone Totem Visualization - Full height */}
          <div className="flex-1 w-full h-full bg-gradient-to-b from-sky-200 via-blue-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl relative">
            <Canvas
              camera={{ position: [0, 8, 12], fov: 50 }}
              gl={{ antialias: true }}
              className="w-full h-full"
            >
              {/* Lighting */}
              <ambientLight intensity={0.7} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <pointLight position={[-5, 5, -5]} intensity={0.6} color="#FFD93D" />

              {/* Camera Controls */}
              <PerspectiveCamera makeDefault position={[0, 8, 12]} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2.5}
              />

              {/* Ground/Platform */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <cylinderGeometry args={[8, 8, 0.5, 32]} />
                <meshStandardMaterial color="#8B7355" />
              </mesh>

              {/* Stone Totem Base */}
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[1.5, 1.8, 1, 16]} />
                <meshStandardMaterial color="#6B6B6B" roughness={0.8} />
              </mesh>

              {/* Stone Totem Middle */}
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[1.2, 1.5, 1, 16]} />
                <meshStandardMaterial color="#7B7B7B" roughness={0.8} />
              </mesh>

              {/* Stone Totem Top - Tiltable */}
              <group ref={totemRef} position={[0, 2.5, 0]}>
                <mesh>
                  <cylinderGeometry args={[1, 1.2, 1.5, 16]} />
                  <meshStandardMaterial color="#8B8B8B" roughness={0.8} />
                </mesh>
                
                {/* Players on top */}
                {players.map((player, index) => {
                  const angle = (index / players.length) * Math.PI * 2;
                  const radius = 1.3;
                  return (
                    <mesh
                      key={player.name}
                      position={[Math.cos(angle) * radius, 1, Math.sin(angle) * radius]}
                    >
                      <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
                      <meshStandardMaterial color={player.avatarColor} />
                    </mesh>
                  );
                })}
              </group>

              {/* Balance indicator rings */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[1.8, 2.2, 32]} />
                <meshStandardMaterial 
                  color={Math.abs(totemBalance) < 10 ? "#6BCB77" : Math.abs(totemBalance) < 30 ? "#FFD93D" : "#FF6B6B"}
                  opacity={0.6}
                  transparent
                />
              </mesh>
            </Canvas>

            {/* Timer Overlay - Top Left */}
            <div className="absolute top-4 left-4 text-center z-10">
              <div className="text-3xl mb-1">⏱️</div>
              <div
                className="text-3xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {timeLeft}s
              </div>
            </div>

            {/* Hold Time Overlay - Top Right */}
            <div className="absolute top-4 right-4 text-center z-10">
              <div className="text-sm text-gray-600 mb-1">Hold Time</div>
              <div
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {holdTime.toFixed(1)}s
              </div>
            </div>

            {/* Balance indicator - Bottom Center */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
              <div className={`px-4 py-2 rounded-full shadow-lg font-semibold ${
                Math.abs(totemBalance) < 10 
                  ? 'bg-green-500/90 text-white' 
                  : Math.abs(totemBalance) < 30 
                  ? 'bg-yellow-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                Balance: {totemBalance > 0 ? '+' : ''}{totemBalance.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* My player card and controls - Compact */}
        <div className="mt-2 space-y-2">
          <PlayerCard
            name={players[0].name}
            score={players[0].score}
            avatarColor={players[0].avatarColor}
            status={gameStarted ? 'active' : 'waiting'}
            isMe
            size="small"
          />

          <PlayfulButton
            onClick={handleBalance}
            variant="secondary"
            size="large"
            disabled={!gameStarted}
            className="w-full"
          >
            ⚖️ BALANCE! ⚖️
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
