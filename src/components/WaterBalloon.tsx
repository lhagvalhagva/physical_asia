import React, { useState, useEffect, useCallback, useRef } from 'react';
import Phaser from 'phaser';
import { PlayfulButton } from './PlayfulButton';
import { TopBar } from './TopBar';
import { DiceButton } from './DiceButton';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  position: number;
}

interface WaterBalloonProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

export function WaterBalloon({ players, onGameEnd, onHome, onLeaderboard }: WaterBalloonProps) {
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTargets, setPlayerTargets] = useState<number[]>([0, 0]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playerPositions, setPlayerPositions] = useState<number[]>([50, 50]);
  const [gameWon, setGameWon] = useState<number | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastRolls, setLastRolls] = useState<number[]>([0, 0]);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const phaserContainerRef = useRef<HTMLDivElement>(null);
  
  const gamePlayers = players.slice(0, 2);

  const handleStartGame = () => {
    const num = parseInt(inputValue);
    if (num > 0 && num <= 100) {
      setTargetNumber(num);
      setPlayerTargets([num, num]);
      setGameStarted(true);
      setPlayerPositions([0, 100]);
    }
  };

  class BalloonRaceScene extends Phaser.Scene {
    private player1?: Phaser.GameObjects.Container;
    private player2?: Phaser.GameObjects.Container;
    private balloon?: Phaser.GameObjects.Container;
    private trackX: number = 0;
    private trackWidth: number = 0;
    private trackY: number = 0;
    private playerPositions: number[] = [0, 100];
    private playerColors: string[] = ['#4D96FF', '#FF6B6B'];
    private lastRolls: number[] = [0, 0];
    private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private player1RollText?: Phaser.GameObjects.Text;
    private player2RollText?: Phaser.GameObjects.Text;

    constructor() {
      super({ key: 'BalloonRaceScene' });
    }

    create() {
      const width = this.scale.width;
      const height = this.scale.height;
      
      this.children.removeAll();
      
      const trackHeight = Math.max(25, Math.min(35, height * 0.18));
      const trackPadding = Math.max(30, width * 0.05);
      const playerSize = Math.max(35, Math.min(50, Math.min(width, height) * 0.12));
      const balloonRadius = Math.max(35, Math.min(50, Math.min(width, height) * 0.13));
      
      this.trackWidth = Math.max(200, width - (trackPadding * 2));
      this.trackX = trackPadding;
      this.trackY = height / 2;
      
      const bg = this.add.graphics();
      bg.fillGradientStyle(0xe0f7fa, 0xe0f7fa, 0xb2ebf2, 0xb2ebf2);
      bg.fillRect(0, 0, width, height);
      
      const track = this.add.graphics();
      track.fillStyle(0x000000, 0.2);
      track.fillRoundedRect(this.trackX + 2, this.trackY - trackHeight / 2 + 2, this.trackWidth, trackHeight, trackHeight / 2);
      track.fillGradientStyle(0xf5f5f5, 0xe0e0e0, 0xd3d3d3, 0xc0c0c0);
      track.fillRoundedRect(this.trackX, this.trackY - trackHeight / 2, this.trackWidth, trackHeight, trackHeight / 2);
      track.lineStyle(3, 0xffffff);
      track.strokeRoundedRect(this.trackX, this.trackY - trackHeight / 2, this.trackWidth, trackHeight, trackHeight / 2);
      
      const centerLine = this.add.graphics();
      centerLine.lineStyle(2, 0xff6b6b, 0.5);
      centerLine.beginPath();
      centerLine.moveTo(width / 2, this.trackY - trackHeight / 2);
      centerLine.lineTo(width / 2, this.trackY + trackHeight / 2);
      centerLine.strokePath();
      
      const balloonX = width / 2;
      const balloonY = this.trackY - balloonRadius - 20;

      const balloonGlow = this.add.circle(balloonX, balloonY, balloonRadius + 8, 0xff6b6b, 0.3);

      const balloonGraphics = this.add.graphics();
      balloonGraphics.fillGradientStyle(0xff6b6b, 0xff8c8c, 0xffd93d, 0xffe066);
      balloonGraphics.fillCircle(balloonX, balloonY, balloonRadius);
      balloonGraphics.lineStyle(4, 0xffffff);
      balloonGraphics.strokeCircle(balloonX, balloonY, balloonRadius);

      const balloonHighlight = this.add.circle(balloonX - balloonRadius * 0.3, balloonY - balloonRadius * 0.3, balloonRadius * 0.4, 0xffffff, 0.4);

      const balloonString = this.add.graphics();
      balloonString.lineStyle(2, 0x666666);
      balloonString.beginPath();
      balloonString.moveTo(balloonX, balloonY + balloonRadius);
      balloonString.lineTo(balloonX, this.trackY - trackHeight / 2);
      balloonString.strokePath();

      this.balloon = this.add.container(balloonX, balloonY, [balloonGlow, balloonGraphics, balloonHighlight, balloonString]);
      
      this.tweens.add({
        targets: this.balloon,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      // Player 1 - Detailed character with Physical Asia style
      const player1X = this.trackX + (this.playerPositions[0] / 100) * this.trackWidth;
      const player1Color = parseInt(this.playerColors[0].replace('#', '0x') || '0x4D96FF');
      
      // Player 1 body (head + body)
      const player1Head = this.add.circle(0, -playerSize * 0.3, playerSize * 0.4, player1Color);
      const player1Body = this.add.ellipse(0, playerSize * 0.2, playerSize * 0.7, playerSize * 0.9, player1Color);
      const player1Border = this.add.graphics();
      player1Border.lineStyle(3, 0xffffff);
      player1Border.strokeCircle(0, -playerSize * 0.3, playerSize * 0.4);
      player1Border.strokeEllipse(0, playerSize * 0.2, playerSize * 0.7, playerSize * 0.9);
      
      // Player 1 eyes
      const player1Eye1 = this.add.circle(-playerSize * 0.15, -playerSize * 0.35, playerSize * 0.08, 0xffffff);
      const player1Eye2 = this.add.circle(playerSize * 0.15, -playerSize * 0.35, playerSize * 0.08, 0xffffff);
      
      // Player 1 roll text (above player)
      this.player1RollText = this.add.text(player1X, this.trackY - playerSize - 15, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#4D96FF',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 4,
      });
      this.player1RollText.setOrigin(0.5, 0.5);
      this.player1RollText.setVisible(false);
      
      this.player1 = this.add.container(player1X, this.trackY, [
        player1Body, player1Head, player1Border, player1Eye1, player1Eye2
      ]);
      
      // Player 2 - Detailed character
      const player2X = this.trackX + (this.playerPositions[1] / 100) * this.trackWidth;
      const player2Color = parseInt(this.playerColors[1].replace('#', '0x') || '0xFF6B6B');
      
      // Player 2 body
      const player2Head = this.add.circle(0, -playerSize * 0.3, playerSize * 0.4, player2Color);
      const player2Body = this.add.ellipse(0, playerSize * 0.2, playerSize * 0.7, playerSize * 0.9, player2Color);
      const player2Border = this.add.graphics();
      player2Border.lineStyle(3, 0xffffff);
      player2Border.strokeCircle(0, -playerSize * 0.3, playerSize * 0.4);
      player2Border.strokeEllipse(0, playerSize * 0.2, playerSize * 0.7, playerSize * 0.9);
      
      // Player 2 eyes
      const player2Eye1 = this.add.circle(-playerSize * 0.15, -playerSize * 0.35, playerSize * 0.08, 0xffffff);
      const player2Eye2 = this.add.circle(playerSize * 0.15, -playerSize * 0.35, playerSize * 0.08, 0xffffff);
      
      this.player2RollText = this.add.text(player2X, this.trackY - playerSize - 15, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#FF6B6B',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 4,
      });
      this.player2RollText.setOrigin(0.5, 0.5);
      this.player2RollText.setVisible(false);
      
      this.player2 = this.add.container(player2X, this.trackY, [
        player2Body, player2Head, player2Border, player2Eye1, player2Eye2
      ]);
      
      // Create particle texture
      const particleTexture = this.add.graphics();
      particleTexture.fillStyle(0xffffff);
      particleTexture.fillCircle(0, 0, 4);
      particleTexture.generateTexture('particle', 8, 8);
      particleTexture.destroy();
      
      // Movement particles effect
      this.particles = this.add.particles(0, 0, 'particle', {
        speed: { min: 30, max: 60 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        lifespan: 400,
        frequency: 30,
      });
      this.particles.setVisible(false);
    }

    updatePositions(positions: number[], colors: string[], rolls: number[], currentTurn: number) {
      this.playerPositions = positions;
      this.playerColors = colors;
      this.lastRolls = rolls;
      
      if (this.player1) {
        const newX1 = this.trackX + (positions[0] / 100) * this.trackWidth;
        const oldX1 = this.player1.x;
        
        this.tweens.add({
          targets: this.player1,
          x: newX1,
          duration: 500,
          ease: 'Power2',
          onStart: () => {
            // Movement animation - bounce effect
            this.tweens.add({
              targets: this.player1,
              y: this.trackY - 5,
              duration: 250,
              yoyo: true,
              ease: 'Bounce.easeOut',
            });
          },
        });
        
        // Update player color
        const player1Color = parseInt(colors[0].replace('#', '0x') || '0x4D96FF');
        if (this.player1.list) {
          (this.player1.list[0] as Phaser.GameObjects.Ellipse)?.setFillStyle(player1Color);
          (this.player1.list[1] as Phaser.GameObjects.Arc)?.setFillStyle(player1Color);
        }
        
        // Update roll text - only show for current turn, hide if not current turn
        if (this.player1RollText) {
          this.player1RollText.setX(newX1);
          if (rolls[0] > 0 && currentTurn === 0) {
            this.player1RollText.setText(`🎲 ${rolls[0]}`);
            this.player1RollText.setVisible(true);
            this.player1RollText.setAlpha(1);
            // Fade out after 2 seconds
            this.tweens.add({
              targets: this.player1RollText,
              alpha: 0,
              duration: 500,
              delay: 1500,
              onComplete: () => {
                if (this.player1RollText && currentTurn !== 0) {
                  this.player1RollText.setVisible(false);
                  this.player1RollText.setAlpha(1);
                }
              },
            });
          } else {
            this.player1RollText.setVisible(false);
            this.player1RollText.setAlpha(1);
          }
        }
        
        // Particle effect on movement
        if (this.particles && Math.abs(newX1 - oldX1) > 5) {
          this.particles.setPosition(newX1, this.trackY);
          this.particles.setVisible(true);
          this.time.delayedCall(300, () => {
            if (this.particles) this.particles.setVisible(false);
          });
        }
      }
      
      if (this.player2) {
        const newX2 = this.trackX + (positions[1] / 100) * this.trackWidth;
        const oldX2 = this.player2.x;
        
        this.tweens.add({
          targets: this.player2,
          x: newX2,
          duration: 500,
          ease: 'Power2',
          onStart: () => {
            // Movement animation - bounce effect
            this.tweens.add({
              targets: this.player2,
              y: this.trackY - 5,
              duration: 250,
              yoyo: true,
              ease: 'Bounce.easeOut',
            });
          },
        });
        
        // Update player color
        const player2Color = parseInt(colors[1].replace('#', '0x') || '0xFF6B6B');
        if (this.player2.list) {
          (this.player2.list[0] as Phaser.GameObjects.Ellipse)?.setFillStyle(player2Color);
          (this.player2.list[1] as Phaser.GameObjects.Arc)?.setFillStyle(player2Color);
        }
        
        if (this.player2RollText) {
          this.player2RollText.setX(newX2);
          if (rolls[1] > 0 && currentTurn === 1) {
            this.player2RollText.setText(`🎲 ${rolls[1]}`);
            this.player2RollText.setVisible(true);
            this.player2RollText.setAlpha(1);
            // Fade out after 2 seconds
            this.tweens.add({
              targets: this.player2RollText,
              alpha: 0,
              duration: 500,
              delay: 1500,
              onComplete: () => {
                if (this.player2RollText && currentTurn !== 1) {
                  this.player2RollText.setVisible(false);
                  this.player2RollText.setAlpha(1);
                }
              },
            });
          } else {
            this.player2RollText.setVisible(false);
            this.player2RollText.setAlpha(1);
          }
        }
        
        if (this.particles && Math.abs(newX2 - oldX2) > 5) {
          this.particles.setPosition(newX2, this.trackY);
          this.particles.setVisible(true);
          this.time.delayedCall(300, () => {
            if (this.particles) this.particles.setVisible(false);
          });
        }
      }
    }
  }

  // Initialize Phaser game
  useEffect(() => {
    if (!gameStarted || !phaserContainerRef.current || phaserGameRef.current) return;

    const getContainerSize = () => {
      if (!phaserContainerRef.current) return { width: 800, height: 200 };
      const rect = phaserContainerRef.current.getBoundingClientRect();
      return {
        width: Math.max(rect.width || 800, 300),
        height: Math.max(rect.height || 200, 150),
      };
    };

    // Wait for container to be rendered
    const initTimer = setTimeout(() => {
      if (!phaserContainerRef.current || phaserGameRef.current) return;

      const size = getContainerSize();

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: size.width,
        height: size.height,
        parent: phaserContainerRef.current,
        backgroundColor: '#f0f0f0',
        scene: BalloonRaceScene,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      phaserGameRef.current = new Phaser.Game(config);
    }, 100);

    // Handle window resize
    const handleResize = () => {
      if (phaserGameRef.current && phaserContainerRef.current) {
        const newSize = getContainerSize();
        phaserGameRef.current.scale.resize(newSize.width, newSize.height);
        const scene = phaserGameRef.current.scene.getScene('BalloonRaceScene') as BalloonRaceScene;
        if (scene) {
          // Recreate scene elements on resize
          scene.scene.restart();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [gameStarted]);

  // Update Phaser scene when positions change
  useEffect(() => {
    if (!phaserGameRef.current || !gameStarted) return;
    
    const scene = phaserGameRef.current.scene.getScene('BalloonRaceScene') as BalloonRaceScene;
    if (scene && scene.updatePositions) {
      const colors = [
        gamePlayers[0]?.avatarColor || '#4D96FF',
        gamePlayers[1]?.avatarColor || '#FF6B6B',
      ];
      scene.updatePositions(playerPositions, colors, lastRolls, currentTurn);
    }
  }, [playerPositions, gameStarted, gamePlayers, lastRolls, currentTurn]);

  const handleRoll = (result: number) => {
    if (gameWon !== null || !gameStarted) return;

    setLastRoll(result);
    setLastRolls((prev) => {
      const newRolls = [...prev];
      newRolls[currentTurn] = result;
      return newRolls;
    });
    
    setPlayerTargets((prev) => {
      const newTargets = [...prev];
      const newTarget = Math.max(0, prev[currentTurn] - result);
      newTargets[currentTurn] = newTarget;
      
      if (newTarget === 0) {
        setGameWon(currentTurn);
      setTimeout(() => endGame(), 2000);
      }
      
      return newTargets;
    });

    setPlayerPositions((prev) => {
      const newPositions = [...prev];
      const moveDistance = (result / 6) * 10;
      
      if (currentTurn === 0) {
        // Player 1 moves from left (0%) towards center (50%)
        newPositions[0] = Math.min(50, prev[0] + moveDistance);
      } else {
        newPositions[1] = Math.max(50, prev[1] - moveDistance);
      }
      
      return newPositions;
    });

    if (result === 6) {
      setTimeout(() => {
        setLastRoll(null);
      }, 1000);
    } else {
      setTimeout(() => {
        setCurrentTurn((prev) => {
          const nextTurn = (prev + 1) % 2;
          setLastRolls((rolls) => {
            const newRolls = [...rolls];
            newRolls[prev] = 0;
            return newRolls;
          });
          return nextTurn;
        });
        setLastRoll(null);
      }, 1000);
    }
  };

  const endGame = useCallback(() => {
    setGameStarted(false);
    const winnerIndex = gameWon !== null ? gameWon : 0;
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === winnerIndex ? 1000 + (targetNumber || 0) : Math.floor(Math.random() * 500),
      position: playerPositions[index] || 50,
    }));
    setTimeout(() => onGameEnd(updatedPlayers), 500);
  }, [gameWon, targetNumber, playerPositions, players, onGameEnd]);

  useEffect(() => {
    if (!gameStarted || currentTurn !== 1 || gameWon !== null) return;

    let rollCount = 0;
    const maxRolls = 10;
    
    const opponentRollDice = () => {
      if (rollCount >= maxRolls || gameWon !== null) {
        setCurrentTurn(0);
        setLastRoll(null);
        return;
      }
      
      rollCount++;
      const opponentRoll = Math.floor(Math.random() * 6) + 1;
      
      setLastRoll(opponentRoll);
      setLastRolls((prev) => {
        const newRolls = [...prev];
        newRolls[1] = opponentRoll;
        return newRolls;
      });
      
      setPlayerTargets((prev) => {
        const newTargets = [...prev];
        const newTarget = Math.max(0, prev[1] - opponentRoll);
        newTargets[1] = newTarget;
        
        if (newTarget === 0) {
          setGameWon(1);
          setTimeout(() => endGame(), 2000);
          return newTargets;
        }
        
        return newTargets;
      });

      // Move opponent closer to balloon (visual only, doesn't affect win condition)
      setPlayerPositions((prev) => {
        const newPositions = [...prev];
        const moveDistance = (opponentRoll / 6) * 10;
        // Player 2 moves from right (100%) towards center (50%)
        newPositions[1] = Math.max(50, prev[1] - moveDistance);
        
        return newPositions;
      });

      // If rolled 6, opponent gets another turn
      if (opponentRoll === 6) {
        setTimeout(() => {
          setLastRoll(null);
          // Roll again after 1 second
          setTimeout(() => {
            opponentRollDice();
          }, 1000);
        }, 1000);
      } else {
        // Switch turn if not 6
        setTimeout(() => {
          // Clear previous player's roll text
          setLastRolls((prev) => {
            const newRolls = [...prev];
            newRolls[1] = 0;
            return newRolls;
          });
          setCurrentTurn(0);
          setLastRoll(null);
        }, 1000);
      }
    };

    const timer = setTimeout(() => {
      opponentRollDice();
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentTurn, gameStarted, gameWon, endGame]);

  // Input screen
  if (!gameStarted && targetNumber === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar
          title="🎯 Balloon Race"
          matchId="12345"
          onHomeClick={onHome}
          onLeaderboardClick={onLeaderboard}
        />

        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 max-w-md w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-gray-800">
              Зорилтот тоо оруулах
            </h2>
            <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
              Тоо оруулна уу (1-100). Эхлээд 0 болгосон нь хожно!
            </p>
            
            <div className="space-y-3 md:space-y-4">
              <input
                type="number"
                min="1"
                max="100"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Тоо оруулах (1-100)"
                className="w-full px-3 md:px-4 py-2 md:py-3 text-xl md:text-2xl text-center rounded-xl md:rounded-2xl border-2 md:border-4 border-gray-200 focus:border-[#4D96FF] focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleStartGame();
                  }
                }}
              />
              
              <PlayfulButton
                onClick={handleStartGame}
                variant="primary"
                size="large"
                className="w-full"
                disabled={!inputValue || parseInt(inputValue) <= 0 || parseInt(inputValue) > 100}
              >
                🚀 Тоглоом эхлүүлэх
              </PlayfulButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="🎯 Balloon Race"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
      />

      <div className="flex-1 flex flex-col p-2 md:p-4">
        {/* Target Numbers Display - Each player has their own */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4">
          {/* Player 1 Target */}
          <div className="text-center">
            <div className="text-xs md:text-sm text-gray-600 mb-1">{gamePlayers[0]?.name || 'Та'}</div>
            <div
              className="text-2xl md:text-4xl font-bold"
              style={{
                background: playerTargets[0] === 0 
                  ? 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)'
                  : 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {playerTargets[0]}
            </div>
            {lastRoll && currentTurn === 0 && (
              <div className="text-xs md:text-sm text-gray-500 mt-1">
                {playerTargets[0] + lastRoll} - {lastRoll} = {playerTargets[0]}
              </div>
            )}
          </div>

          {/* Player 2 Target */}
          <div className="text-center">
            <div className="text-xs md:text-sm text-gray-600 mb-1">{gamePlayers[1]?.name || 'Өрсөлдөгч'}</div>
            <div
              className="text-2xl md:text-4xl font-bold"
                style={{
                background: playerTargets[1] === 0 
                  ? 'linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%)'
                  : 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {playerTargets[1]}
            </div>
            {lastRoll && currentTurn === 1 && (
              <div className="text-xs md:text-sm text-gray-500 mt-1">
                {playerTargets[1] + lastRoll} - {lastRoll} = {playerTargets[1]}
              </div>
            )}
          </div>
        </div>

        {/* Game Area - Phaser Canvas */}
        <div className="flex-1 flex flex-col justify-center gap-2 md:gap-4 min-h-0">
          {gameStarted && (
            <div 
              ref={phaserContainerRef}
              className="w-full rounded-2xl overflow-hidden bg-gray-100"
                    style={{
                minHeight: '150px',
                height: '200px',
              }}
            />
          )}

          {/* Win Message */}
          {gameWon !== null && (
            <div className="text-center animate-pop">
              <div className="text-4xl md:text-6xl mb-2 md:mb-4">🎉</div>
              <div className="text-2xl md:text-4xl font-bold text-[#6BCB77]">
                {gameWon === 0 ? gamePlayers[0]?.name : gamePlayers[1]?.name} Хожлоо!
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {!gameWon && (
          <div className="mt-2 md:mt-4 space-y-2 md:space-y-4">
            <div className="text-center">
              {currentTurn === 0 ? (
                <div className="text-base md:text-xl text-gray-700 mb-2 md:mb-4">
                  {lastRoll === 6 ? (
                    <span className="text-[#6BCB77] font-bold animate-pulse">
                      🎉 6 буусан! Дахин хая! 🎉
                    </span>
                  ) : (
                    <span>🎲 Таны ээлж! Шоо хая!</span>
                  )}
                </div>
              ) : (
                <div className="text-base md:text-xl text-gray-500 mb-2 md:mb-4">
                  {lastRoll === 6 ? (
                    <span className="text-[#FF6B6B]">
                      ⚠️ Өрсөлдөгч 6 буулгалаа! Дахин хаяж байна...
                    </span>
                  ) : (
                    <span>⏳ Өрсөлдөгчийн ээлж...</span>
                  )}
                </div>
              )}
            </div>

          <div className="flex justify-center">
            <DiceButton
              onRoll={handleRoll}
                disabled={!gameStarted || currentTurn !== 0 || gameWon !== null}
                isActive={gameStarted && currentTurn === 0 && gameWon === null}
            />
          </div>
            </div>
          )}
      </div>
    </div>
  );
}