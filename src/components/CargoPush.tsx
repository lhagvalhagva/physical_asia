import React, { useEffect, useRef, useState } from 'react';
import { PlayfulButton } from './PlayfulButton';
import { PlayerCard } from './PlayerCard';
import { TopBar } from './TopBar';

interface Player {
  name: string;
  score: number;
  avatarColor: string;
  progress: number; // 0-100
}

interface CargoPushProps {
  players: Player[];
  onGameEnd: (players: Player[]) => void;
  onHome: () => void;
  onLeaderboard: () => void;
}

type Turn = 'player' | 'opponent';

const LANE_LABELS = ['Дээд зам', 'Дунд зам', 'Доод зам'];
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

interface DiceFaceProps {
  owner: Turn;
  value: number | null;
  active: boolean;
}

const DiceFace = ({ owner, value, active }: DiceFaceProps) => {
  const title = owner === 'player' ? 'Таны шоо' : 'AI шоо';
  const accent = owner === 'player' ? 'text-indigo-500' : 'text-rose-500';
  const border =
    owner === 'player'
      ? 'border-indigo-200 bg-white'
      : 'border-rose-200 bg-rose-50';

  return (
    <div className={`flex flex-col items-center gap-2 ${active ? '' : 'opacity-60'}`}>
      <div className={`text-xs uppercase tracking-wide font-semibold ${accent}`}>{title}</div>
      <div
        className={`relative w-28 h-28 rounded-[1.4rem] border-8 ${border} shadow-2xl flex items-center justify-center transition-all ${
          active ? 'scale-100' : 'scale-95'
        }`}
        style={{
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.25)',
        }}
      >
        {value === null ? (
          <span className="text-4xl text-slate-200 font-bold">–</span>
        ) : (
          <div className="grid grid-cols-3 grid-rows-3 gap-1 w-20 h-20">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-center">
                {DICE_DOTS[value]?.includes(idx) && (
                  <span
                    className={`block w-3 h-3 rounded-full ${
                      owner === 'player' ? 'bg-indigo-500' : 'bg-rose-500'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {value === null ? 'Шидэлтийг хүлээнэ' : `Үр дүн: ${value}`}
      </div>
    </div>
  );
};

export function CargoPush({ players, onGameEnd, onHome, onLeaderboard }: CargoPushProps) {
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

  const lanePositionsRef = useRef(lanePositions);
  const gameOverRef = useRef(gameOver);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

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
      if (currentTurn === 'player' && pendingMoveValue !== null) {
        setMessage('⏰ Цаг дууслаа. Ээлж AI-д шилжинэ.');
        setCurrentTurn('opponent');
        setPlayerDice(null);
        setPendingMoveValue(null);
      }
      return;
    }

    const id = setInterval(() => {
      setMoveTimerLeft((prev) => {
        if (gameOverRef.current) return prev ?? null;
        if (prev === null) return null;
        if (prev <= 0) {
          if (currentTurn === 'player' && pendingMoveValue !== null) {
            setMessage('⏰ Цаг дууслаа. Ээлж AI-д шилжинэ.');
            setCurrentTurn('opponent');
            setPlayerDice(null);
            setPendingMoveValue(null);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [moveTimerLeft, currentTurn, pendingMoveValue]);

  const finalizeGame = (winner: Turn, laneIndex?: number, customMessage?: string) => {
    if (gameOverRef.current) return;
    clearPendingTimeouts();
    setGameOver(true);
    gameOverRef.current = true;
    setPlayerDice(null);
    setOpponentDice(null);
    setPendingMoveValue(null);

    if (laneIndex === undefined && !customMessage) {
      customMessage = winner === 'player' ? 'Та яллаа!' : 'AI яллаа.';
    }

    const victoryMessage =
      customMessage ??
      (winner === 'player'
        ? `+30-д хүрсэн тул та яллаа!`
        : `-30-д очсон тул AI яллаа.`);
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

    scheduleTimeout(() => onGameEnd(updatedPlayers), 1500);
  };

  const finalizeDraw = (customMessage: string) => {
    if (gameOverRef.current) return;
    clearPendingTimeouts();
    setGameOver(true);
    gameOverRef.current = true;
    setPlayerDice(null);
    setOpponentDice(null);
    setPendingMoveValue(null);
    setMessage(customMessage);

    scheduleTimeout(() => onGameEnd(players), 1500);
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
    setMessage('⏰ AI-ийн цаг дууслаа. Хайрцгийн байрлалаар ялагчийг тодорхойлно.');
    
    scheduleTimeout(() => {
      if (gameOverRef.current) return;
      resolveWinnerByCargoPosition();
    }, 1000);
  };

  const resolveWinnerByCargoPosition = () => {
    if (gameOverRef.current) return;

    const snapshot = lanePositionsRef.current;
    // positiveLanes: таны талд (эерэг чиглэлд) байгаа хайрцгууд
    // negativeLanes: AI талд (сөрөг чиглэлд) байгаа хайрцгууд
    const positiveLanes = snapshot.filter((pos) => pos > 0);
    const negativeLanes = snapshot.filter((pos) => pos < 0);

    const positiveCount = positiveLanes.length; // Таны талд хэдэн хайрцаг байна
    const negativeCount = negativeLanes.length; // AI талд хэдэн хайрцаг байна

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
    // negativeCount > positiveCount → AI талд илүү хайрцаг → AI ялна
    else if (negativeCount > positiveCount) {
      finalizeGame('opponent', undefined, '⏳ Хугацаа дууслаа. AI талд хайрцаг илүү тул AI яллаа.');
    } 
    // Тэнцүү тоотой бол зайг харна
    // positiveDistance > negativeDistance → таны тал илүү ихээр түрсэн → та ялна
    else if (positiveDistance > negativeDistance) {
      finalizeGame('player', undefined, '⏳ Тэнцүү тоотой ч таны тал илүү ихээр түрсэн тул та яллаа.');
    } 
    // negativeDistance > positiveDistance → AI илүү ихээр түрсэн → AI ялна
    else if (negativeDistance > positiveDistance) {
      finalizeGame('opponent', undefined, '⏳ Тэнцүү тоотой ч AI илүү ихээр түрсэн тул AI яллаа.');
    } 
    // Бүх зүйл тэнцүү
    else {
      finalizeDraw('⏳ Хугацаа дууслаа. Үр дүн тэнцэв.');
    }
  };


  const handleRollDice = () => {
    if (gameOver) return;
    if (currentTurn !== 'player') {
      setMessage('AI шидэж байна, түр хүлээнэ үү.');
      return;
    }
    if (pendingMoveValue !== null) {
      setMessage('Эхлээд шооны нүүдлээ аль замд хэрэглэхээ шийд.');
      return;
    }

    const value = rollDice();
    setPlayerDice(value);

    if (value === 6) {
      const newCount = consecutiveSixesPlayer + 1;
      setConsecutiveSixesPlayer(newCount);
      
      if (newCount >= 3) {
        setConsecutiveSixesPlayer(0);
        setPlayerDice(null);
        setMessage('⚠️ 3 удаа дараалан 6 буусан тул энэ шидэлт хүчингүй боллоо. Ээлж AI-д шилжинэ.');
        setCurrentTurn('opponent');
        return;
      }
    } else {
      setConsecutiveSixesPlayer(0);
    }

    setPendingMoveValue(value);
    setMoveTimerLeft(5);
    setMessage(`Шоо ${value} буулаа. Хайрцаг дээр дараад хөдөлгөөрэй.`);
    // Шоо хаясны дараа цаг зогсоохгүй, үргэлжлүүлнэ
  };

  const handlePlayerMove = (laneIndex: number) => {
    if (gameOver) return;
    if (currentTurn !== 'player') {
      setMessage('Одоо AI-ийн ээлж байна. Түр хүлээнэ үү.');
      return;
    }
    if (pendingMoveValue === null) {
      return;
    }

    const value = pendingMoveValue;
    const snapshot = lanePositionsRef.current;
    const before = snapshot[laneIndex];
    const after = Math.min(MAX_DISTANCE, before + value);
    const updated = snapshot.map((pos, idx) => (idx === laneIndex ? after : pos));

    lanePositionsRef.current = updated;
    setLanePositions(updated);
    setSelectedLane(laneIndex);
    setPlayerDice(null);
    setPendingMoveValue(null);
    setMoveTimerLeft(null);

    if (after >= MAX_DISTANCE) {
      finalizeGame('player', laneIndex);
      return;
    }

    if (value === 6) {
      setMessage('6 буусан тул дахин шидэх эрхтэй!');
      return;
    } else {
      setConsecutiveSixesPlayer(0);
    }

    setMessage('AI ээлжээ бэлдэж байна...');
    setCurrentTurn('opponent');
    // Ээлж AI-д шилжихэд AI-ийн цаг эхлэнэ (useEffect автоматаар ажиллана)
  };

  const runOpponentTurn = () => {
    if (gameOverRef.current) return;
    const value = rollDice();
    setOpponentDice(value);
    setMoveTimerLeft(5);

    if (value === 6) {
      const newCount = consecutiveSixesOpponent + 1;
      setConsecutiveSixesOpponent(newCount);
      
      if (newCount >= 3) {
        setConsecutiveSixesOpponent(0);
        setOpponentDice(null);
        setMessage('⚠️ AI 3 удаа дараалан 6 буусан тул энэ шидэлт хүчингүй боллоо. Таны ээлж.');
        setCurrentTurn('player');
        return;
      }
    } else {
      setConsecutiveSixesOpponent(0);
    }

    const snapshot = lanePositionsRef.current;
    const laneIndex = snapshot.reduce((best, pos, idx, arr) => {
      if (arr[best] > pos) return best;
      return pos > arr[best] ? idx : best;
    }, 0);

    const before = snapshot[laneIndex];
    const after = Math.max(-MAX_DISTANCE, before - value);
    const updated = snapshot.map((pos, idx) => (idx === laneIndex ? after : pos));

    lanePositionsRef.current = updated;
    setSelectedLane(laneIndex);
    setMessage(`🤖 ${value} нэгжээр буцааж байна.`);

    scheduleTimeout(() => {
      if (gameOverRef.current) return;
      setLanePositions(updated);
      setMoveTimerLeft(null);

      if (after <= -MAX_DISTANCE) {
        finalizeGame('opponent', laneIndex);
        return;
      }

      if (value === 6) {
        setOpponentDice(null);
        setMessage('🤖 6 буусан тул AI дахин шиднэ.');
        scheduleTimeout(runOpponentTurn, 900);
      } else {
        setOpponentDice(null);
        setCurrentTurn('player');
        setMessage('Таны ээлж. Шоо шидэж зам сонгоорой.');
        // Ээлж тоглогч рүү шилжихэд тоглогчийн цаг эхлэнэ (useEffect автоматаар ажиллана)
      }
    }, 600);
  };

  useEffect(() => {
    if (gameOver || currentTurn !== 'opponent') return;
    scheduleTimeout(runOpponentTurn, 900);
  }, [currentTurn, gameOver]);

  const playerStatus = currentTurn === 'player' && !gameOver ? 'active' : 'waiting';
  const rollButtonDisabled = gameOver || currentTurn !== 'player' || pendingMoveValue !== null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar
        title="📦 Cargo Push"
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
                <DiceFace owner="opponent" value={opponentDice} active={currentTurn === 'opponent'} />
                <DiceFace owner="player" value={playerDice ?? pendingMoveValue} active={currentTurn === 'player'} />
              </div>

              <div className="bg-indigo-50 text-indigo-900 rounded-2xl p-4 text-sm leading-relaxed min-h-[80px]">
                {message}
                {moveTimerLeft !== null && (
                  <div className="mt-2 text-xs text-indigo-700 font-semibold">
                    ⏰ Хайрцаг сонгох цаг: {moveTimerLeft}с
                  </div>
                )}
          </div>

              <PlayfulButton
                onClick={handleRollDice}
                variant="primary"
                size="large"
                disabled={rollButtonDisabled}
                className="w-full"
                children="🎲 ШОО ШИДЭХ"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

