import React, { useEffect, useRef, useState } from 'react';
import { TopBar } from './TopBar';
import { DiceButton } from './DiceButton';
import { wsClient } from '../websocket/client';
import { gameService } from '../api/services/game';
import bgRotateImage from '../assets/images/bg-rotate.png';
import { Dices, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  progress: number;
}

interface CargoPushProps {
  players: Player[];
  onGameEnd: (players: Player[], gameResult?: any) => void;
  onHome: () => void;
  onLeaderboard: () => void;
  sessionId?: string; // Optional: sessionId from matchmaking
  gameSession?: any; // Game session data with opponent info
}

type Turn = 'player' | 'opponent';

const MAX_DISTANCE = 30;

const createInitialLanes = (): number[] => [0, 0, 0];
const toPercent = (value: number) => ((value + MAX_DISTANCE) / (MAX_DISTANCE * 2)) * 100;
const rollDice = () => Math.floor(Math.random() * 6) + 1;
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const DICE_DOTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DICE_ICONS: { [key: number]: React.ElementType } = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
};

interface DiceFaceProps {
  owner: Turn;
  value: number | null;
  active: boolean;
  opponentName?: string;
  onClick?: () => void;
  isRolling?: boolean;
  rollingValue?: number | null;
}

const DiceFace = ({ owner, value, active, opponentName, onClick, isRolling: externalIsRolling, rollingValue: externalRollingValue }: DiceFaceProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [rollingValue, setRollingValue] = useState<number | null>(null);
  
  const isRollingState = owner === 'player' ? isRolling : (externalIsRolling ?? false);
  const rollingValueState = owner === 'player' ? rollingValue : (externalRollingValue ?? null);
  
  const title = owner === 'player' ? 'Таны шоо' : (opponentName ? `${opponentName}-ийн шоо` : 'Өрсөлдөгчийн шоо');
  const isPlayer = owner === 'player';
  const accent = isPlayer ? 'text-indigo-600' : 'text-rose-600';
  const border = isPlayer
    ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-white'
    : 'border-rose-300 bg-gradient-to-br from-rose-50 to-white';
  const dotColor = isPlayer ? 'bg-indigo-600' : 'bg-rose-600';
  const glowColor = isPlayer
    ? 'shadow-[0_0_20px_rgba(99,102,241,0.4)]'
    : 'shadow-[0_0_20px_rgba(244,63,94,0.4)]';

  useEffect(() => {
    if (value !== null && isRolling) {
      setIsRolling(false);
      setRollingValue(null);
    }
  }, [value, isRolling]);

  const handleClick = () => {
    if (onClick && isPlayer && active && value === null) {
      setIsRolling(true);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        const randomFace = Math.floor(Math.random() * 6) + 1;
        setRollingValue(randomFace);
        
        if (count > 10) {
          clearInterval(interval);
          onClick();
        }
      }, 100);
    }
  };

  const displayValue = isRollingState ? rollingValueState : value;
  const CurrentIcon = displayValue ? DICE_ICONS[displayValue] : Dices;

  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-300 ${active ? '' : 'opacity-50'}`}>
      <div className={`text-sm font-bold ${accent} flex items-center gap-2 ${active ? 'animate-pulse' : ''}`}>
        <span className="text-base">{isPlayer ? '👤' : '🤖'}</span>
        <span>{title}</span>
      </div>
      <button
        onClick={handleClick}
        disabled={!isPlayer || !active || value !== null || isRolling}
        className={`relative w-32 h-32 rounded-2xl border-4 ${border} shadow-xl flex items-center justify-center transition-all duration-300 ${
          active ? `scale-105 ${glowColor} ring-4 ring-offset-2 ${isPlayer ? 'ring-indigo-200' : 'ring-rose-200'}` : 'scale-100'
        } ${isPlayer && active && value === null && !isRollingState ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} ${isRollingState ? 'animate-shake' : ''}`}
        style={{
          boxShadow: active
            ? `0 20px 60px rgba(15, 23, 42, 0.3), ${isPlayer ? '0 0 30px rgba(99, 102, 241, 0.3)' : '0 0 30px rgba(244, 63, 94, 0.3)'}`
            : '0 10px 30px rgba(15, 23, 42, 0.15)',
        }}
      >
        {displayValue === null ? (
          <div className="flex flex-col items-center gap-2">
            <Dices className={`w-16 h-16 ${isPlayer ? 'text-indigo-400' : 'text-rose-400'} ${isRollingState ? 'animate-spin' : 'animate-pulse'}`} strokeWidth={3} />
            {isRollingState && <span className={`text-xs font-medium animate-pulse ${isPlayer ? 'text-indigo-600' : 'text-rose-600'}`}>Эргэж байна...</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <CurrentIcon 
              className={`w-16 h-16 ${isPlayer ? 'text-indigo-600' : 'text-rose-600'} transition-all duration-75 ${isRollingState ? 'opacity-80 animate-spin' : 'opacity-100'}`} 
              strokeWidth={3} 
            />
          </div>
        )}
        {active && value !== null && (
          <div className={`absolute -top-2 -right-2 w-6 h-6 ${isPlayer ? 'bg-indigo-500' : 'bg-rose-500'} rounded-full animate-ping`} />
        )}
      </button>
      <div className={`text-sm font-semibold transition-colors ${active ? accent : 'text-slate-400'}`}>
        {displayValue === null ? null : (
          <span className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span>Үр дүн: <span className="text-xl font-bold">{displayValue}</span></span>
          </span>
        )}
      </div>
    </div>
  );
};

export function CargoPush({ players, onGameEnd, onHome, onLeaderboard, sessionId: propSessionId, gameSession }: CargoPushProps) {
  const [lanePositions, setLanePositions] = useState<number[]>(createInitialLanes);
  const [playerDice, setPlayerDice] = useState<number | null>(null);
  const [pendingMoveValue, setPendingMoveValue] = useState<number | null>(null);
  const [opponentDice, setOpponentDice] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [currentTurn, setCurrentTurn] = useState<Turn>('player');
  const [gameOver, setGameOver] = useState(false);
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  const [playerTimeLeft, setPlayerTimeLeft] = useState(30);
  const [opponentTimeLeft, setOpponentTimeLeft] = useState(30);
  const [moveTimerLeft, setMoveTimerLeft] = useState<number | null>(null);
  const [consecutiveSixesPlayer, setConsecutiveSixesPlayer] = useState(0);
  const [consecutiveSixesOpponent, setConsecutiveSixesOpponent] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [gameStarted, setGameStarted] = useState(false);
  const [isOpponentRolling, setIsOpponentRolling] = useState(false);
  const [opponentRollingValue, setOpponentRollingValue] = useState<number | null>(null);

  const lanePositionsRef = useRef(lanePositions);
  const gameOverRef = useRef(gameOver);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const sessionIdRef = useRef<string | null>(null);
  const playerIdRef = useRef<string | null>(null);
  const opponentIdRef = useRef<string | null>(null);
  const isPlayer1Ref = useRef<boolean>(false);

  const player = players[0];

  const scheduleTimeout = (cb: () => void, delay: number) => {
    const id = setTimeout(cb, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    lanePositionsRef.current = lanePositions;
  }, [lanePositions]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    return () => clearPendingTimeouts();
  }, []);

  // Initialize PvP game session
  useEffect(() => {
    const playerId = localStorage.getItem('playerId');
    playerIdRef.current = playerId;

    if (propSessionId) {
      sessionIdRef.current = propSessionId;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('sessionId');
      if (urlSessionId) {
        sessionIdRef.current = urlSessionId;
      }
    }

    // Setup game session and determine player order
    if (sessionIdRef.current && gameSession && playerId) {
      // Find opponent
      const opponent = gameSession.players?.find((p: any) => p.playerId !== playerId);
      if (opponent) {
        opponentIdRef.current = opponent.playerId;
        setOpponentName(opponent.username || 'Opponent');
      }

      // Determine if current player is player 1 (first player goes first)
      if (gameSession.players && gameSession.players.length >= 2) {
        isPlayer1Ref.current = gameSession.players[0].playerId === playerId;
        setIsMyTurn(isPlayer1Ref.current);
        setCurrentTurn(isPlayer1Ref.current ? 'player' : 'opponent');
        setMessage(isPlayer1Ref.current ? 'Таны ээлж. Шоо шидэж эхлээрэй.' : 'Хүлээж байна...');
      }

      // Join WebSocket session
      if (wsClient.isConnected()) {
        wsClient.joinGame(sessionIdRef.current, playerId);
        console.log('✅ Joined PvP game session:', sessionIdRef.current);
      }
    } else if (sessionIdRef.current && wsClient.isConnected() && playerId) {
      // Fallback: join without session data
      wsClient.joinGame(sessionIdRef.current, playerId);
    }
  }, [propSessionId, gameSession]);

  // WebSocket listeners for PvP
  useEffect(() => {
    if (!sessionIdRef.current || !wsClient.isConnected()) return;

    const socket = wsClient.getSocket();
    if (!socket) return;

    // Listen for opponent's dice roll
    const handleOpponentDiceRoll = (data: { playerId: string; diceValue: number }) => {
      if (data.playerId === playerIdRef.current) return; // Ignore own actions
      
      console.log('🎲 Opponent rolled dice:', data.diceValue);
      setOpponentDice(data.diceValue);
      setIsOpponentRolling(false);
      setOpponentRollingValue(null);
      setMessage(`🎲 ${opponentName} ${data.diceValue} буулгалаа. Хайрцаг сонгох хүлээнэ...`);
      // Opponent's turn - wait for their move
      setIsMyTurn(false);
      setCurrentTurn('opponent');
    };

    // Listen for opponent's move
    const handleOpponentMove = (data: { playerId: string; laneIndex: number; diceValue: number; newPositions: number[]; isPlayer1?: boolean }) => {
      if (data.playerId === playerIdRef.current) {
        console.log('⏭️ Ignoring own move');
        return; // Ignore own actions
      }
      
      console.log('📦 Opponent moved:', data);
      
      // The positions from opponent are already in the correct coordinate system
      // (opponent's perspective: they move in opposite direction)
      // We just use them directly since both players share the same coordinate system
      lanePositionsRef.current = data.newPositions;
      setLanePositions(data.newPositions);
      setSelectedLane(data.laneIndex);
      setOpponentDice(null);
      setIsOpponentRolling(false);
      setOpponentRollingValue(null);

      // Check for win condition
      // If opponent is player 1, they win at +MAX_DISTANCE
      // If opponent is player 2, they win at -MAX_DISTANCE
      const opponentIsPlayer1 = data.isPlayer1 !== undefined ? data.isPlayer1 : !isPlayer1Ref.current;
      const winPosition = opponentIsPlayer1 ? MAX_DISTANCE : -MAX_DISTANCE;
      
      if ((opponentIsPlayer1 && data.newPositions[data.laneIndex] >= winPosition) ||
          (!opponentIsPlayer1 && data.newPositions[data.laneIndex] <= winPosition)) {
        scheduleTimeout(() => {
          finalizeGame('opponent', data.laneIndex);
        }, 500);
        return;
      }

      // Turn management - Switch to player's turn if dice is not 6
      scheduleTimeout(() => {
        if (data.diceValue === 6) {
          setMessage(`🎲 ${opponentName} 6 буусан тул дахин шиднэ.`);
          // Keep opponent's turn
          setIsMyTurn(false);
          setCurrentTurn('opponent');
        } else {
          // Switch to player's turn
          console.log('🔄 Switching to player turn after opponent move (dice:', data.diceValue, ')');
          setIsMyTurn(true);
          setCurrentTurn('player');
          setMessage('Таны ээлж. Шоо шидэж зам сонгоорой.');
          
          // Force state update
          setTimeout(() => {
            console.log('✅ Turn switched - isMyTurn:', true, 'currentTurn:', 'player');
          }, 100);
        }
      }, 500);
    };

    // Listen for game state updates
    const handleGameState = (data: { playerId: string; state: any; timestamp?: number }) => {
      console.log('📡 Received game state:', data);
      
      // Ignore own actions
      if (data.playerId === playerIdRef.current) {
        console.log('⏭️ Ignoring own action');
        return;
      }

      // Handle different event types
      if (data.state?.type === 'dice_roll') {
        handleOpponentDiceRoll({ playerId: data.playerId, diceValue: data.state.diceValue });
      } else if (data.state?.type === 'move') {
        const positions = data.state.positions || data.state.newPositions || data.state.lanePositions;
        if (positions && Array.isArray(positions)) {
          handleOpponentMove({
            playerId: data.playerId,
            laneIndex: data.state.laneIndex,
            diceValue: data.state.diceValue,
            newPositions: positions
          });
        } else {
          console.warn('⚠️ Invalid move data:', data.state);
        }
      } else if (data.state?.type === 'turn_change') {
        console.log('🔄 Turn change received:', data.state);
        setIsMyTurn(data.state.isMyTurn);
        setCurrentTurn(data.state.isMyTurn ? 'player' : 'opponent');
        if (data.state.isMyTurn) {
          setMessage('Таны ээлж. Шоо шидэж зам сонгоорой.');
        } else {
          setMessage(`${opponentName}-ийн ээлж. Хүлээж байна...`);
        }
      } else {
        // Try to handle as direct move event (fallback)
        if (data.state?.laneIndex !== undefined && data.state?.positions) {
          console.log('📦 Handling as direct move event');
          handleOpponentMove({
            playerId: data.playerId,
            laneIndex: data.state.laneIndex,
            diceValue: data.state.diceValue || data.state.value,
            newPositions: data.state.positions,
            isPlayer1: data.state.isPlayer1
          });
        }
      }
    };

    // Listen for player joined
    const handlePlayerJoined = (data: { playerId: string; socketId: string }) => {
      console.log('👤 Player joined:', data);
      if (data.playerId !== playerIdRef.current && !gameStarted) {
        setGameStarted(true);
        setMessage('Тоглоом эхэлж байна...');
        // First player (player 1) starts
        if (isPlayer1Ref.current) {
          scheduleTimeout(() => {
            setIsMyTurn(true);
            setCurrentTurn('player');
            setMessage('Таны ээлж. Шоо шидэж эхлээрэй.');
          }, 1000);
        }
      }
    };

    socket.on('game:state', handleGameState);
    socket.on('player:joined', handlePlayerJoined);

    // Also listen for direct move events (in case backend sends different structure)
    const handleDirectMove = (data: any) => {
      console.log('📦 Direct move event:', data);
      if (data.playerId && data.playerId !== playerIdRef.current) {
        if (data.laneIndex !== undefined && (data.positions || data.newPositions)) {
          handleOpponentMove({
            playerId: data.playerId,
            laneIndex: data.laneIndex,
            diceValue: data.diceValue || data.value,
            newPositions: data.positions || data.newPositions
          });
        }
      }
    };

    // Listen for opponent's turn end (when they finish their move)
    const handleOpponentTurnEnd = (data: any) => {
      console.log('🔄 Opponent turn ended:', data);
      if (data.playerId !== playerIdRef.current) {
        setIsMyTurn(true);
        setCurrentTurn('player');
        setMessage('Таны ээлж. Шоо шидэж зам сонгоорой.');
      }
    };

    socket.on('game:move', handleDirectMove);
    socket.on('game:turn_end', handleOpponentTurnEnd);

    return () => {
      socket.off('game:state', handleGameState);
      socket.off('player:joined', handlePlayerJoined);
      socket.off('game:move', handleDirectMove);
      socket.off('game:turn_end', handleOpponentTurnEnd);
    };
  }, [sessionIdRef.current, opponentName, gameStarted]);


  // Шатрын цаг: зөвхөн одоогийн ээлжийн тоглогчийн цаг явна
  useEffect(() => {
    if (gameOverRef.current) return;
    if (currentTurn !== 'player') return;

    const id = setInterval(() => {
      setPlayerTimeLeft((prev) => {
        if (gameOverRef.current) return prev;
        if (prev <= 0) {
          // Тоглогчийн цаг дууслаа - хайрцгийн байрлалаар ялагчийг тодорхойлох
          handlePlayerTimeOut();
          return 0;
        }
        return prev - 1;
      });
      }, 1000);

    return () => clearInterval(id);
  }, [currentTurn, gameOver]);

  useEffect(() => {
    if (gameOverRef.current) return;
    if (currentTurn !== 'opponent') return;

    const id = setInterval(() => {
      setOpponentTimeLeft((prev) => {
        if (gameOverRef.current) return prev;
        if (prev <= 0) {
          // AI-ийн цаг дууслаа - хайрцгийн байрлалаар ялагчийг тодорхойлох
          handleOpponentTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [currentTurn, gameOver]);

  // Шоо шидэх болгонд 5 секунд timer
  useEffect(() => {
    if (gameOverRef.current) return;
    if (moveTimerLeft === null) return;
    if (moveTimerLeft <= 0) {
      setMoveTimerLeft(null);
      if (currentTurn === 'player' && pendingMoveValue !== null && isMyTurn) {
        setMessage(`⏰ Цаг дууслаа. Ээлж ${opponentName}-д шилжинэ.`);
        setIsMyTurn(false);
        setCurrentTurn('opponent');
        setPlayerDice(null);
        setPendingMoveValue(null);
        
        // Send turn change to opponent
        if (sessionIdRef.current && playerIdRef.current) {
          wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
            type: 'turn_change',
            isMyTurn: false
          });
        }
      }
      return;
    }

    const id = setInterval(() => {
      setMoveTimerLeft((prev) => {
        if (gameOverRef.current) return prev ?? null;
        if (prev === null) return null;
        if (prev <= 0) {
          if (currentTurn === 'player' && pendingMoveValue !== null && isMyTurn) {
            setMessage(`⏰ Цаг дууслаа. Ээлж ${opponentName}-д шилжинэ.`);
            setIsMyTurn(false);
            setCurrentTurn('opponent');
            setPlayerDice(null);
            setPendingMoveValue(null);
            
            // Send turn change to opponent
            if (sessionIdRef.current && playerIdRef.current) {
              wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
                type: 'turn_change',
                isMyTurn: false
              });
            }
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [moveTimerLeft, currentTurn, pendingMoveValue, isMyTurn, opponentName]);

  // Submit game result to backend
  const submitGameResult = async (winner: Turn) => {
    if (!sessionIdRef.current) return;

    try {
      const winnerScore = winner === 'player' ? 500 : 100;
      const winnerRank = winner === 'player' ? 1 : 2;
      const gameTime = 30 - (currentTurn === 'player' ? playerTimeLeft : opponentTimeLeft);

      await gameService.submitResult(
        sessionIdRef.current,
        winnerScore,
        {
          time: gameTime,
          winner: winner === 'player',
          finalPositions: lanePositionsRef.current,
          gameType: 'cargo-push'
        },
        winnerRank
      );

      console.log('✅ Game result submitted to backend');
    } catch (error) {
      console.error('❌ Error submitting game result:', error);
      // Don't block game flow if submission fails
    }
  };

  const finalizeGame = async (winner: Turn, laneIndex?: number, customMessage?: string) => {
    if (gameOverRef.current) return;
    clearPendingTimeouts();
    setGameOver(true);
    gameOverRef.current = true;
    setPlayerDice(null);
    setOpponentDice(null);
    setPendingMoveValue(null);

    if (laneIndex === undefined && !customMessage) {
      customMessage = winner === 'player' ? 'Та яллаа!' : `${opponentName} яллаа.`;
    }

    const victoryMessage =
      customMessage ??
      (winner === 'player'
        ? `+30-д хүрсэн тул та яллаа!`
        : `-30-д очсон тул ${opponentName} яллаа.`);
    setMessage(victoryMessage);

    const updatedPlayers = players.map((p, index) => {
      if (index === 0) {
        return {
          ...p,
          score: p.score + (winner === 'player' ? 500 : 100),
          progress: winner === 'player' ? 100 : Math.max(0, p.progress - 20),
        };
      }
      if (index === 1) {
        return {
          ...p,
          score: p.score + (winner === 'opponent' ? 400 : 50),
          progress: winner === 'opponent' ? 100 : p.progress,
        };
      }
      return p;
    });

    // Submit result to backend if session exists
    let gameResult = null;
    if (sessionIdRef.current) {
      gameResult = await submitGameResult(winner);
    }

    // Pass game result to onGameEnd callback
    scheduleTimeout(() => {
      onGameEnd(updatedPlayers, gameResult);
    }, 1500);
  };

  const finalizeDraw = async (customMessage: string) => {
    if (gameOverRef.current) return;
    clearPendingTimeouts();
    setGameOver(true);
    gameOverRef.current = true;
    setPlayerDice(null);
    setOpponentDice(null);
    setPendingMoveValue(null);
    setMessage(customMessage);

    // Submit draw result to backend if session exists
    if (sessionIdRef.current) {
      try {
        const gameTime = 30 - (currentTurn === 'player' ? playerTimeLeft : opponentTimeLeft);
        await gameService.submitResult(
          sessionIdRef.current,
          250, // Draw score (average)
          {
            time: gameTime,
            winner: false,
            draw: true,
            finalPositions: lanePositionsRef.current,
            gameType: 'cargo-push'
          },
          1 // Both players rank 1 in draw
        );
        console.log('✅ Draw result submitted to backend');
      } catch (error) {
        console.error('❌ Error submitting draw result:', error);
      }
    }

    scheduleTimeout(() => onGameEnd(players, null), 1500);
  };

  const resetBoard = () => {
    clearPendingTimeouts();
    const fresh = createInitialLanes();
    lanePositionsRef.current = fresh;
    gameOverRef.current = false;
    setLanePositions(fresh);
    setPlayerDice(null);
    setPendingMoveValue(null);
    setOpponentDice(null);
    setSelectedLane(null);
    setCurrentTurn('player');
    setGameOver(false);
    setPlayerTimeLeft(30);
    setOpponentTimeLeft(30);
    setMoveTimerLeft(null);
    setConsecutiveSixesPlayer(0);
    setConsecutiveSixesOpponent(0);
    setMessage('');
  };

  const handlePlayerTimeOut = () => {
    if (gameOverRef.current) return;
    setMessage('⏰ Таны цаг дууслаа. Хайрцгийн байрлалаар ялагчийг тодорхойлно.');
    
    scheduleTimeout(() => {
      if (gameOverRef.current) return;
      resolveWinnerByCargoPosition();
    }, 1000);
  };

  const handleOpponentTimeOut = () => {
    if (gameOverRef.current) return;
    setMessage(`⏰ ${opponentName}-ийн цаг дууслаа. Хайрцгийн байрлалаар ялагчийг тодорхойлно.`);
    
    scheduleTimeout(() => {
      if (gameOverRef.current) return;
      resolveWinnerByCargoPosition();
    }, 1000);
  };

  const resolveWinnerByCargoPosition = () => {
    if (gameOverRef.current) return;

    const snapshot = lanePositionsRef.current;
    // positiveLanes: таны талд (эерэг чиглэлд) байгаа хайрцгууд
    // negativeLanes: Opponent талд (сөрөг чиглэлд) байгаа хайрцгууд
    const positiveLanes = snapshot.filter((pos) => pos > 0);
    const negativeLanes = snapshot.filter((pos) => pos < 0);

    const positiveCount = positiveLanes.length; // Таны талд хэдэн хайрцаг байна
    const negativeCount = negativeLanes.length; // Opponent талд хэдэн хайрцаг байна

    const positiveDistance = positiveLanes.reduce((sum, pos) => sum + pos, 0);
    const negativeDistance = negativeLanes.reduce((sum, pos) => sum + Math.abs(pos), 0);

    // Бүх хайрцгууд төвд байвал тэнцэх
    if (positiveCount === 0 && negativeCount === 0) {
      finalizeDraw('⏳ Хугацаа дууслаа. Хайрцгууд төвд байсан тул тэнцэв.');
      return;
    }

    // Дүрэм: Аль талд илүү хайрцаг байвал тэр тал ялна
    // positiveCount > negativeCount → таны талд илүү хайрцаг → та ялна
    if (positiveCount > negativeCount) {
      finalizeGame('player', undefined, '⏳ Хугацаа дууслаа. Таны талд хайрцаг илүү тул та яллаа.');
    } 
    // negativeCount > positiveCount → Opponent талд илүү хайрцаг → Opponent ялна
    else if (negativeCount > positiveCount) {
      finalizeGame('opponent', undefined, `⏳ Хугацаа дууслаа. ${opponentName}-ийн талд хайрцаг илүү тул ${opponentName} яллаа.`);
    } 
    // Тэнцүү тоотой бол зайг харна
    // positiveDistance > negativeDistance → таны тал илүү ихээр түрсэн → та ялна
    else if (positiveDistance > negativeDistance) {
      finalizeGame('player', undefined, '⏳ Тэнцүү тоотой ч таны тал илүү ихээр түрсэн тул та яллаа.');
    } 
    // negativeDistance > positiveDistance → Opponent илүү ихээр түрсэн → Opponent ялна
    else if (negativeDistance > positiveDistance) {
      finalizeGame('opponent', undefined, `⏳ Тэнцүү тоотой ч ${opponentName} илүү ихээр түрсэн тул ${opponentName} яллаа.`);
    } 
    // Бүх зүйл тэнцүү
    else {
      finalizeDraw('⏳ Хугацаа дууслаа. Үр дүн тэнцэв.');
    }
  };


  const handleRollDice = (value: number) => {
    if (gameOver) return;
    if (!isMyTurn || currentTurn !== 'player') {
      setMessage(`${opponentName}-ийн ээлж байна. Түр хүлээнэ үү.`);
      return;
    }
    if (pendingMoveValue !== null) {
      setMessage('Эхлээд шооны нүүдлээ аль замд хэрэглэхээ шийд.');
      return;
    }

    setPlayerDice(value);

    if (value === 6) {
      const newCount = consecutiveSixesPlayer + 1;
      setConsecutiveSixesPlayer(newCount);
      
      if (newCount >= 3) {
        setConsecutiveSixesPlayer(0);
        setPlayerDice(null);
        setMessage('⚠️ 3 удаа дараалан 6 буусан тул энэ шидэлт хүчингүй боллоо. Ээлж өрсөлдөгч рүү шилжинэ.');
        setIsMyTurn(false);
        setCurrentTurn('opponent');
        
        // Send turn change to opponent
        if (sessionIdRef.current && playerIdRef.current) {
          wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
            type: 'turn_change',
            isMyTurn: false
          });
        }
        return;
      }
    } else {
      setConsecutiveSixesPlayer(0);
    }

    setPendingMoveValue(value);
    setMoveTimerLeft(5);
    setMessage(`Шоо ${value} буулаа. Хайрцаг дээр дараад хөдөлгөөрэй.`);

    // Send dice roll to opponent via WebSocket
    if (sessionIdRef.current && playerIdRef.current) {
      wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
        type: 'dice_roll',
        diceValue: value
      });
    }
  };

  const handlePlayerMove = (laneIndex: number) => {
    if (gameOver) return;
    if (!isMyTurn || currentTurn !== 'player') {
      setMessage(`${opponentName}-ийн ээлж байна. Түр хүлээнэ үү.`);
      return;
    }
    if (pendingMoveValue === null) {
      return;
    }

    const value = pendingMoveValue;
    const snapshot = lanePositionsRef.current;
    const before = snapshot[laneIndex];
    
    // Player 1 moves in positive direction (right), Player 2 moves in negative direction (left)
    // isPlayer1Ref.current means we are player 1, so we move right (+value)
    // If we are player 2, we should move left (-value), but we handle that when receiving opponent's move
    const after = isPlayer1Ref.current 
      ? Math.min(MAX_DISTANCE, before + value)  // Player 1: move right (+)
      : Math.max(-MAX_DISTANCE, before - value); // Player 2: move left (-)
    
    const updated = snapshot.map((pos, idx) => (idx === laneIndex ? after : pos));

    lanePositionsRef.current = updated;
    setLanePositions(updated);
    setSelectedLane(laneIndex);
    setPlayerDice(null);
    setPendingMoveValue(null);
    setMoveTimerLeft(null);

    // Send move to opponent via WebSocket
    if (sessionIdRef.current && playerIdRef.current) {
      wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
        type: 'move',
        laneIndex,
        diceValue: value,
        positions: updated,
        isPlayer1: isPlayer1Ref.current // Include player role for reference
      });
    }

    // Win condition: Player 1 wins at +MAX_DISTANCE, Player 2 wins at -MAX_DISTANCE
    if (isPlayer1Ref.current && after >= MAX_DISTANCE) {
      finalizeGame('player', laneIndex);
      return;
    } else if (!isPlayer1Ref.current && after <= -MAX_DISTANCE) {
      finalizeGame('player', laneIndex);
      return;
    }

    if (value === 6) {
      setMessage('6 буусан тул дахин шидэх эрхтэй!');
      return;
    } else {
      setConsecutiveSixesPlayer(0);
    }

    // Turn changes to opponent (unless dice was 6)
    if (value !== 6) {
      setIsMyTurn(false);
      setCurrentTurn('opponent');
      setMessage(`${opponentName}-ийн ээлж. Хүлээж байна...`);
      
      // Send turn change to opponent
      if (sessionIdRef.current && playerIdRef.current) {
        wsClient.updateGameState(sessionIdRef.current, playerIdRef.current, {
          type: 'turn_change',
          isMyTurn: false,
          message: `${opponentName}-ийн ээлж`
        });
      }
    }
  };

  // Removed AI opponent logic - now handled via WebSocket

  // Debug: Log turn changes
  useEffect(() => {
    console.log('🔄 Turn changed:', { isMyTurn, currentTurn, opponentName });
  }, [isMyTurn, currentTurn, opponentName]);

  const playerStatus = isMyTurn && !gameOver ? 'active' : 'waiting';
  const rollButtonDisabled = gameOver || !isMyTurn || currentTurn !== 'player' || pendingMoveValue !== null;

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url(${bgRotateImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <TopBar
        title="Cargo Push"
        matchId="12345"
        onHomeClick={onHome}
        onLeaderboardClick={onLeaderboard}
        timeLeft={currentTurn === 'player' ? playerTimeLeft : opponentTimeLeft}
        formatTime={formatTime}
      />

      <div className="flex-1 p-6 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          {/* Board */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
              <div className="space-y-4">
                {lanePositions.map((position, index) => (
                  <button
                    key={index}
                    onClick={() => handlePlayerMove(index)}
                    className={`w-full rounded-2xl p-4 text-left transition-all group ${
                      selectedLane === index
                        ? 'bg-indigo-50'
                        : 'bg-slate-300'
                    }`}
                    disabled={gameOver}
                  >
                    <div className="relative h-20 bg-slate-200 rounded-xl shadow-inner overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-800 -translate-x-1/2 z-20" />
                      <div className="absolute inset-y-4 left-[15%] w-0.5 bg-slate-200" />
                      <div className="absolute inset-y-4 right-[15%] w-0.5 bg-slate-200" />

                      <div
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                          left: `calc(${toPercent(position)}% - 2rem)`,
              }}
            >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-3xl transition-all duration-200">
                          📦
            </div>
          </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

              </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <DiceFace 
                  owner="opponent" 
                  value={opponentDice} 
                  active={!isMyTurn && currentTurn === 'opponent'} 
                  opponentName={opponentName}
                  isRolling={isOpponentRolling}
                  rollingValue={opponentRollingValue}
                />
                <DiceFace 
                  owner="player" 
                  value={playerDice ?? pendingMoveValue} 
                  active={isMyTurn && currentTurn === 'player'} 
                />
              </div>
              <div className={`rounded-2xl p-5 text-sm leading-relaxed min-h-[100px] transition-all duration-300 ${
                isMyTurn
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-900 border-2 border-indigo-200'
                  : 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-900 border-2 border-rose-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {isMyTurn ? '👤' : '👥'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold mb-2 text-base">{message}</div>
                    {moveTimerLeft !== null && (
                      <div className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-lg inline-block ${
                        moveTimerLeft <= 2
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : moveTimerLeft <= 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        ⏰ Хайрцаг сонгох цаг: {moveTimerLeft}с
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <DiceButton
                  onRoll={handleRollDice}
                  disabled={rollButtonDisabled}
                  isActive={isMyTurn && currentTurn === 'player' && !gameOver && pendingMoveValue === null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}