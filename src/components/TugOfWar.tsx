import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Phaser from 'phaser';
import { PlayfulButton } from './PlayfulButton';
import { TopBar } from './TopBar';
import { PlayerCard } from './PlayerCard';
import { CountdownNumber } from './CountdownNumber';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
}

interface TugOfWarProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

class TugChallengeScene extends Phaser.Scene {
  private leftStone!: Phaser.GameObjects.Container;
  private rightStone!: Phaser.GameObjects.Container;
  private leftBase!: Phaser.GameObjects.Container;
  private rightBase!: Phaser.GameObjects.Container;
  private character!: Phaser.GameObjects.Container;
  private leftHandcuff!: Phaser.GameObjects.Container;
  private rightHandcuff!: Phaser.GameObjects.Container;
  private chainGraphics!: Phaser.GameObjects.Graphics;
  private leftAngle: number = -0.4;
  private rightAngle: number = 0.4;
  private angleReductionSpeed: number = 0.02;
  private onAngleUpdate?: (leftAngle: number, rightAngle: number) => void;

  constructor() {
    super({ key: 'TugChallengeScene' });
  }

  init(data: { onAngleUpdate?: (leftAngle: number, rightAngle: number) => void }) {
    this.onAngleUpdate = data?.onAngleUpdate;
  }

  create() {
    const { width, height } = this.scale;

    this.createBackground(width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    this.character = this.createCharacter();
    this.character.setPosition(centerX, centerY);

    const stoneSpacing = Math.min(width / 2.5, width * 0.35);
    const groundY = height * 0.75;
    const baseHeight = Math.max(25, height * 0.04);

    this.leftStone = this.createStone(0x8b7355, width, height);
    this.leftStone.setPosition(centerX - stoneSpacing, groundY - baseHeight);
    this.leftStone.setRotation(this.leftAngle);
    this.leftStone.setDepth(1);

    this.leftBase = this.createBase(width, height);
    this.leftBase.setPosition(centerX - stoneSpacing, groundY);
    this.leftBase.setDepth(10);

    this.rightStone = this.createStone(0x6b5d4f, width, height);
    this.rightStone.setPosition(centerX + stoneSpacing, groundY - baseHeight);
    this.rightStone.setRotation(this.rightAngle);
    this.rightStone.setDepth(1);

    this.rightBase = this.createBase(width, height);
    this.rightBase.setPosition(centerX + stoneSpacing, groundY);
    this.rightBase.setDepth(10);

    this.leftHandcuff = this.createHandcuff();
    this.leftHandcuff.setPosition(centerX - 30, centerY);
    this.leftHandcuff.setDepth(6);

    this.rightHandcuff = this.createHandcuff();
    this.rightHandcuff.setPosition(centerX + 30, centerY);
    this.rightHandcuff.setDepth(6);

    this.character.setDepth(7);

    this.chainGraphics = this.add.graphics();
    this.chainGraphics.setDepth(5);

    this.input.on('pointerdown', () => {
      if (this.leftAngle < 0) {
        this.leftAngle = Math.min(0, this.leftAngle + this.angleReductionSpeed);
      }
      if (this.rightAngle > 0) {
        this.rightAngle = Math.max(0, this.rightAngle - this.angleReductionSpeed);
      }
      if (this.onAngleUpdate) {
        this.onAngleUpdate(this.leftAngle, this.rightAngle);
      }
    });

    this.time.addEvent({
      delay: 16,
      callback: this.updateStones,
      callbackScope: this,
      loop: true,
    });
  }

  private createBackground(width: number, height: number) {
    const bg = this.add.graphics();
    const skyColor1 = 0x87ceeb;
    const skyColor2 = 0x4682b4;
    const groundColor = 0x8b7355;

    bg.fillGradientStyle(skyColor1, skyColor1, skyColor2, skyColor2, 1);
    bg.fillRect(0, 0, width, height * 0.7);

    bg.fillStyle(groundColor);
    bg.fillRect(0, height * 0.7, width, height * 0.3);

    bg.fillStyle(0x6b5d4f);
    const pixelSize = 8;
    for (let x = 0; x < width; x += pixelSize * 2) {
      for (let y = height * 0.7; y < height; y += pixelSize * 2) {
        if ((x / (pixelSize * 2) + y / (pixelSize * 2)) % 2 === 0) {
          bg.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
  }

  private createBase(width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const graphics = this.add.graphics();

    const baseWidth = Math.max(100, Math.min(120, width * 0.15));
    const baseHeight = Math.max(20, Math.min(30, height * 0.04));
    const baseColor = 0x5a5a5a;

    graphics.fillStyle(0x3a3a3a);
    graphics.fillRoundedRect(-baseWidth / 2 - 2, -baseHeight - 2, baseWidth + 4, baseHeight + 4, 4);
    graphics.fillStyle(baseColor);
    graphics.fillRoundedRect(-baseWidth / 2, -baseHeight, baseWidth, baseHeight, 4);

    graphics.fillStyle(0x4a4a4a);
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(-baseWidth / 2 + 3, baseWidth / 2 - 3);
      const y = Phaser.Math.Between(-baseHeight + 3, -3);
      graphics.fillRect(x, y, 4, 4);
    }

    graphics.fillStyle(0x6a6a6a);
    graphics.fillRect(-baseWidth / 2 + 5, -baseHeight + 5, baseWidth - 10, 8);

    container.add(graphics);
    return container;
  }

  private createStone(color: number, width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const graphics = this.add.graphics();

    const stoneWidth = Math.max(80, Math.min(100, width * 0.12));
    const stoneHeight = Math.max(180, Math.min(220, height * 0.35));

    graphics.fillStyle(color);
    graphics.fillRoundedRect(-stoneWidth / 2, -stoneHeight, stoneWidth, stoneHeight, 12);

    const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(20).color;
    graphics.fillStyle(darkerColor);
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(-stoneWidth / 2 + 5, stoneWidth / 2 - 5);
      const y = Phaser.Math.Between(-stoneHeight + 5, -5);
      graphics.fillRect(x, y, 6, 6);
    }

    const lighterColor = Phaser.Display.Color.ValueToColor(color).lighten(15).color;
    graphics.fillStyle(lighterColor);
    graphics.fillRect(-stoneWidth / 2 + 10, -stoneHeight + 10, 30, 20);

    container.add(graphics);
    return container;
  }

  private createCharacter(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const graphics = this.add.graphics();

    const pixelSize = Math.max(3, Math.min(4, this.scale.width * 0.005));

    graphics.fillStyle(0xffdbac);
    graphics.fillRect(-6 * pixelSize, -20 * pixelSize, 12 * pixelSize, 12 * pixelSize);

    graphics.fillStyle(0x4a90e2);
    graphics.fillRect(-4 * pixelSize, -8 * pixelSize, 8 * pixelSize, 16 * pixelSize);
    graphics.fillRect(-12 * pixelSize, -6 * pixelSize, 8 * pixelSize, 4 * pixelSize);
    graphics.fillRect(4 * pixelSize, -6 * pixelSize, 8 * pixelSize, 4 * pixelSize);

    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(-4 * pixelSize, 8 * pixelSize, 3 * pixelSize, 10 * pixelSize);
    graphics.fillRect(1 * pixelSize, 8 * pixelSize, 3 * pixelSize, 10 * pixelSize);

    graphics.fillStyle(0x000000);
    graphics.fillRect(-3 * pixelSize, -18 * pixelSize, pixelSize, pixelSize);
    graphics.fillRect(2 * pixelSize, -18 * pixelSize, pixelSize, pixelSize);

    container.add(graphics);
    return container;
  }

  private updateStones() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const stoneHeight = Math.max(180, Math.min(220, this.scale.height * 0.35));
    const baseHeight = Math.max(20, Math.min(30, this.scale.height * 0.04));

    this.leftStone.setRotation(this.leftAngle);
    this.rightStone.setRotation(this.rightAngle);

    const leftStoneTopX = this.leftStone.x + Math.sin(this.leftAngle) * stoneHeight * 0.4;
    const leftStoneTopY = this.leftStone.y - baseHeight - Math.cos(this.leftAngle) * stoneHeight * 0.4;
    const rightStoneTopX = this.rightStone.x + Math.sin(this.rightAngle) * stoneHeight * 0.4;
    const rightStoneTopY = this.rightStone.y - baseHeight - Math.cos(this.rightAngle) * stoneHeight * 0.4;

    const leftCuffX = Phaser.Math.Linear(centerX - 30, leftStoneTopX, 0.3);
    const leftCuffY = Phaser.Math.Linear(centerY, leftStoneTopY, 0.3);
    this.leftHandcuff.setPosition(leftCuffX, leftCuffY);

    const rightCuffX = Phaser.Math.Linear(centerX + 30, rightStoneTopX, 0.3);
    const rightCuffY = Phaser.Math.Linear(centerY, rightStoneTopY, 0.3);
    this.rightHandcuff.setPosition(rightCuffX, rightCuffY);

    this.updateChainVisual(leftStoneTopX, leftStoneTopY, rightStoneTopX, rightStoneTopY);
  }

  private updateChainVisual(leftStoneTopX: number, leftStoneTopY: number, rightStoneTopX: number, rightStoneTopY: number) {
    this.chainGraphics.clear();

    const chainColor = 0x708090;
    const linkRadius = 6;
    const linkSpacing = 20;

    const leftDist = Phaser.Math.Distance.Between(
      this.leftHandcuff.x, this.leftHandcuff.y,
      leftStoneTopX, leftStoneTopY
    );
    const leftLinks = Math.max(1, Math.floor(leftDist / linkSpacing));

    for (let i = 0; i <= leftLinks; i++) {
      const t = leftLinks > 0 ? i / leftLinks : 0;
      const x = Phaser.Math.Linear(this.leftHandcuff.x, leftStoneTopX, t);
      const y = Phaser.Math.Linear(this.leftHandcuff.y, leftStoneTopY, t);
      this.chainGraphics.fillStyle(chainColor);
      this.chainGraphics.fillCircle(x, y, linkRadius);
      this.chainGraphics.fillStyle(0x2a2a2a);
      this.chainGraphics.fillCircle(x, y, linkRadius - 2);
    }

    const rightDist = Phaser.Math.Distance.Between(
      this.rightHandcuff.x, this.rightHandcuff.y,
      rightStoneTopX, rightStoneTopY
    );
    const rightLinks = Math.max(1, Math.floor(rightDist / linkSpacing));

    for (let i = 0; i <= rightLinks; i++) {
      const t = rightLinks > 0 ? i / rightLinks : 0;
      const x = Phaser.Math.Linear(this.rightHandcuff.x, rightStoneTopX, t);
      const y = Phaser.Math.Linear(this.rightHandcuff.y, rightStoneTopY, t);
      this.chainGraphics.fillStyle(chainColor);
      this.chainGraphics.fillCircle(x, y, linkRadius);
      this.chainGraphics.fillStyle(0x2a2a2a);
      this.chainGraphics.fillCircle(x, y, linkRadius - 2);
    }
  }

  private createHandcuff(): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);
    const graphics = this.add.graphics();

    const metalColor = 0x696969;
    const cuffRadius = 12;

    graphics.lineStyle(4, metalColor);
    graphics.strokeCircle(0, 0, cuffRadius);
    graphics.lineStyle(2, 0x555555);
    graphics.strokeCircle(0, 0, cuffRadius - 2);
    graphics.fillStyle(0x555555);
    graphics.fillCircle(-3, -3, 2);
    graphics.fillCircle(3, -3, 2);
    graphics.fillStyle(metalColor);
    graphics.fillRect(-4, -cuffRadius - 2, 8, 4);

    container.add(graphics);
    return container;
  }
}

export function TugOfWar({ players, onGameEnd, onHome, onLeaderboard }: TugOfWarProps) {
  const [countdown, setCountdown] = useState<number | 'GO!' | null>(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [leftAngle, setLeftAngle] = useState(-0.4);
  const [rightAngle, setRightAngle] = useState(0.4);
  const [clicks, setClicks] = useState(0);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const phaserContainerRef = useRef<HTMLDivElement>(null);
  const angleUpdateCallbackRef = useRef<((leftAngle: number, rightAngle: number) => void) | null>(null);

  const endGame = useCallback(() => {
    setGameStarted(false);
    const progress = 1 - (Math.abs(leftAngle) + Math.abs(rightAngle)) / 0.8;
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: index === 0
        ? Math.floor(clicks * 10 + progress * 1000)
        : Math.floor(Math.random() * 1200),
    }));
    setTimeout(() => onGameEnd(updatedPlayers), 1000);
  }, [leftAngle, rightAngle, clicks, players, onGameEnd]);

  const handleAngleUpdate = useCallback((newLeftAngle: number, newRightAngle: number) => {
    setLeftAngle(newLeftAngle);
    setRightAngle(newRightAngle);
    setClicks((prev) => prev + 1);
  }, []);

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
  }, [gameStarted, timeLeft, endGame]);

  useEffect(() => {
    if (!gameStarted) return;

    const checkWin = () => {
      if (Math.abs(leftAngle) < 0.1 && Math.abs(rightAngle) < 0.1) {
        endGame();
      }
    };

    const interval = setInterval(checkWin, 100);
    return () => clearInterval(interval);
  }, [gameStarted, leftAngle, rightAngle, endGame]);

  useEffect(() => {
    angleUpdateCallbackRef.current = handleAngleUpdate;
  }, [handleAngleUpdate]);

  useEffect(() => {
    if (!gameStarted || !phaserContainerRef.current || phaserGameRef.current) return;

    const getContainerSize = () => {
      if (!phaserContainerRef.current) return { width: 800, height: 600 };
      const rect = phaserContainerRef.current.getBoundingClientRect();
      return {
        width: Math.max(rect.width || 800, 300),
        height: Math.max(rect.height || 600, 400),
      };
    };

    const initTimer = setTimeout(() => {
      if (!phaserContainerRef.current || phaserGameRef.current) return;

      const size = getContainerSize();
      const sceneInstance = new TugChallengeScene();
      sceneInstance.init({ 
        onAngleUpdate: (left: number, right: number) => {
          if (angleUpdateCallbackRef.current) {
            angleUpdateCallbackRef.current(left, right);
          }
        }
      });

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: size.width,
        height: size.height,
        parent: phaserContainerRef.current,
        scene: sceneInstance,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        render: {
          pixelArt: true,
          antialias: false,
          roundPixels: true,
        },
      };

      phaserGameRef.current = new Phaser.Game(config);
    }, 100);

    const handleResize = () => {
      if (phaserGameRef.current && phaserContainerRef.current) {
        const newSize = getContainerSize();
        phaserGameRef.current.scale.resize(newSize.width, newSize.height);
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

  const otherPlayers = players.slice(1);
  const progress = gameStarted ? 1 - (Math.abs(leftAngle) + Math.abs(rightAngle)) / 0.8 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="⛓️ Stone Tug Challenge"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
      />

      {countdown !== null && <CountdownNumber number={countdown} />}

      <div className="flex-1 flex flex-col p-2 md:p-4">
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

        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full h-full bg-gradient-to-b from-sky-200 via-blue-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl relative">
            <div ref={phaserContainerRef} className="w-full h-full" />

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

            <div className="absolute top-4 right-4 text-center z-10">
              <div className="text-sm text-gray-600 mb-1">Clicks</div>
              <div
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {clicks}
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
              <div className={`px-4 py-2 rounded-full shadow-lg font-semibold ${
                progress > 0.8
                  ? 'bg-green-500/90 text-white'
                  : progress > 0.5
                  ? 'bg-yellow-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}>
                Progress: {Math.floor(progress * 100)}%
              </div>
            </div>
          </div>
        </div>

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
            onClick={() => {}}
            variant="secondary"
            size="large"
            disabled={!gameStarted}
            className="w-full"
          >
            ⛓️ CLICK TO PULL! ⛓️
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
