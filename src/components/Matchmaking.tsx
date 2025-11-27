import React, { useState } from 'react';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { PlayfulButton } from './PlayfulButton';

interface MatchmakingProps {
  onMatchFound?: (sessionId: string, opponentId: string) => void;
  onCancel?: () => void;
}

export function Matchmaking({ onMatchFound, onCancel }: MatchmakingProps) {
  const [gameType, setGameType] = useState<string>('rope');
  const [mode, setMode] = useState<string>('ranked');
  
  const {
    isSearching,
    queuePosition,
    matchFound,
    sessionId,
    opponentId,
    error,
    joinQueue,
    leaveQueue,
    resetMatch
  } = useMatchmaking();

  const handleStartSearch = () => {
    const gameTypeMap: Record<string, string> = {
      rope: 'tug-of-war',
      balloon: 'water-balloon',
      cargo: 'cargo-push',
    };
    joinQueue(gameTypeMap[gameType] || gameType, mode);
  };

  const handleCancelSearch = () => {
    const gameTypeMap: Record<string, string> = {
      rope: 'tug-of-war',
      balloon: 'water-balloon',
      cargo: 'cargo-push',
    };
    leaveQueue(gameTypeMap[gameType] || gameType, mode);
    onCancel?.();
  };

  React.useEffect(() => {
    if (matchFound && sessionId && opponentId) {
      onMatchFound?.(sessionId, opponentId);
    }
  }, [matchFound, sessionId, opponentId, onMatchFound]);

  if (matchFound && sessionId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-green-600">🎮 Match Found! 🎮</h2>
          <p className="text-gray-700 mb-2 text-sm sm:text-base">Session ID: <span className="text-xs sm:text-sm break-all">{sessionId}</span></p>
          <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">Opponent ID: <span className="text-xs sm:text-sm break-all">{opponentId}</span></p>
          <PlayfulButton
            onClick={() => {
              resetMatch();
              onMatchFound?.(sessionId, opponentId);
            }}
            variant="primary"
            size="large"
          >
            Start Game
          </PlayfulButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Find Match</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {!isSearching ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Type:
              </label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rope">Tug of War</option>
                <option value="balloon">Water Balloon</option>
                <option value="cargo">Cargo Push</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ranked">Ranked</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <PlayfulButton onClick={handleStartSearch} variant="primary" size="large" className="flex-1 w-full sm:w-auto">
                Find Match
              </PlayfulButton>
              {onCancel && (
                <PlayfulButton onClick={onCancel} variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </PlayfulButton>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl text-gray-700 mb-2">🔍 Searching for opponent...</p>
              {queuePosition !== null && (
                <p className="text-gray-600">Position in queue: {queuePosition}</p>
              )}
            </div>
            <PlayfulButton onClick={handleCancelSearch} variant="danger" size="large" className="w-full">
              Cancel Search
            </PlayfulButton>
          </>
        )}
      </div>
    </div>
  );
}

