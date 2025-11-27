# Cargo Push - Simple Backend Integration

## 🎯 Philosophy

**Game Logic = Frontend Only**  
**Backend = Matchmaking + Results Only**

Тоглоомын логик (dice rolls, cargo moves, timers) бүгд frontend-д ажиллана. Backend зөвхөн:

- Matchmaking (opponent олох)
- Game session tracking
- Final results (who won, score, XP)
- Leaderboard update

---

## 🔄 Simplified Flow

```
┌─────────────────────────────────────────────────────────────┐
│              SIMPLIFIED INTEGRATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Matchmaking (Find Opponent)                            │
│     ↓                                                        │
│  2. Get Session ID                                           │
│     ↓                                                        │
│  3. Join Game Session (WebSocket) - Just to track           │
│     ↓                                                        │
│  4. Game Runs Entirely in Frontend                          │
│     • Dice rolls (local)                                    │
│     • Cargo moves (local)                                   │
│     • Turn management (local)                               │
│     ↓                                                        │
│  5. Game Ends                                                │
│     ↓                                                        │
│  6. Submit Final Result to Backend                          │
│     • Winner                                                │
│     • Score                                                 │
│     • XP                                                    │
│     • Time                                                  │
│     ↓                                                        │
│  7. Backend Updates Leaderboard                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 What You Need

### Minimal Integration (3 Steps)

#### Step 1: Get Session ID from Matchmaking

```typescript
// After matchmaking finds opponent
// Navigate to game with sessionId
window.location.href = `/game?sessionId=${sessionId}`;
```

#### Step 2: Join Session (Optional - Just for Tracking)

```typescript
// In CargoPush component
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  
  if (sessionId && socket?.connected) {
    const playerId = localStorage.getItem('playerId');
    socket.emit('game:join', {
      sessionId,
      playerId
    });
  }
}, []);
```

#### Step 3: Submit Final Result

```typescript
// In finalizeGame function
const finalizeGame = async (winner: Turn, laneIndex?: number, customMessage?: string) => {
  // ... your existing game logic ...
  
  // Submit result to backend
  if (sessionIdRef.current) {
    const token = localStorage.getItem('token');
    const playerId = localStorage.getItem('playerId');
    
    await fetch(`http://localhost:5001/api/game/session/${sessionIdRef.current}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: winner === 'player' ? 500 : 100,
        rank: winner === 'player' ? 1 : 2,
        stats: {
          time: 30 - (currentTurn === 'player' ? playerTimeLeft : opponentTimeLeft),
          winner: winner === 'player'
        }
      })
    });
  }
  
  // ... rest of your logic ...
};
```

---

## 🎮 Complete Minimal Integration

### Updated CargoPush Component

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { wsClient } from '../websocket/client';
import { gameService } from '../api/services/game';

export function CargoPush({ players, onGameEnd, onHome, onLeaderboard }: CargoPushProps) {
  // ... all your existing state ...
  
  const sessionIdRef = useRef<string | null>(null);

  // Get sessionId from URL (after matchmaking)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    
    if (sessionId) {
      sessionIdRef.current = sessionId;
      
      // Optional: Join session for tracking
      if (wsClient.isConnected()) {
        const playerId = localStorage.getItem('playerId');
        if (playerId) {
          wsClient.joinGame(sessionId, playerId);
        }
      }
    }
  }, []);

  // Submit game result when game ends
  const submitGameResult = async (winner: Turn) => {
    if (!sessionIdRef.current) return;

    try {
      const winnerScore = winner === 'player' ? 500 : 100;
      const winnerRank = winner === 'player' ? 1 : 2;
      
      await gameService.submitResult(
        sessionIdRef.current,
        winnerScore,
        {
          time: 30 - (currentTurn === 'player' ? playerTimeLeft : opponentTimeLeft),
          winner: winner === 'player',
          finalPositions: lanePositionsRef.current
        },
        winnerRank
      );
      
      console.log('✅ Game result submitted');
    } catch (error) {
      console.error('❌ Error submitting result:', error);
    }
  };

  // Update finalizeGame to submit result
  const finalizeGame = async (winner: Turn, laneIndex?: number, customMessage?: string) => {
    if (gameOverRef.current) return;

    clearPendingTimeouts();
    setGameOver(true);
    gameOverRef.current = true;

    // ... all your existing game logic ...

    // Submit result to backend
    await submitGameResult(winner);

    // ... rest of your existing logic ...
    scheduleTimeout(() => onGameEnd(updatedPlayers), 1500);
  };

  // ... rest of your existing code (NO CHANGES NEEDED) ...
  
  // Your existing functions stay the same:
  // - handleRollDice (no changes)
  // - handlePlayerMove (no changes)
  // - runOpponentTurn (no changes)
  // - All game logic stays in frontend
}
```

---

## 🎯 What Backend Does

### Backend Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│              BACKEND RESPONSIBILITIES                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Matchmaking                                             │
│     • Find opponent                                         │
│     • Create game session                                   │
│     • Return sessionId                                      │
│                                                             │
│  2. Game Session Tracking                                   │
│     • Track active sessions                                 │
│     • Store session metadata                                │
│                                                             │
│  3. Results Processing                                      │
│     • Receive final results                                 │
│     • Calculate rewards (XP, coins)                        │
│     • Update player stats                                   │
│     • Update leaderboard                                    │
│                                                             │
│  ❌ NOT Responsible For:                                    │
│     • Dice rolls                                            │
│     • Cargo moves                                           │
│     • Turn management                                      │
│     • Game state                                            │
│     • Timers                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### What Goes to Backend

```typescript
// Only final result
{
  score: 500,           // Winner's score
  rank: 1,              // 1 = winner, 2 = loser
  stats: {
    time: 25,           // Time taken
    winner: true,       // Did player win?
    finalPositions: [30, 0, 0]  // Optional: final state
  }
}
```

### What Stays in Frontend

```typescript
// All game logic stays local
- Dice rolls
- Cargo positions
- Turn management
- Timers
- Game state
- Win/loss logic
```

---

## 🔄 Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GAME FLOW                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User clicks "Find Match"                                │
│     ↓                                                        │
│  2. Matchmaking finds opponent                               │
│     ↓                                                        │
│  3. Navigate to: /game?sessionId=xxx                        │
│     ↓                                                        │
│  4. CargoPush component loads                                │
│     ↓                                                        │
│  5. Join session (optional, just for tracking)              │
│     ↓                                                        │
│  6. Game runs entirely in frontend:                         │
│     • Player rolls dice (local)                             │
│     • Player moves cargo (local)                            │
│     • AI/opponent plays (local)                             │
│     • All logic in frontend                                 │
│     ↓                                                        │
│  7. Game ends                                                │
│     ↓                                                        │
│  8. Submit final result to backend:                          │
│     POST /api/game/session/{id}/result                      │
│     { score, rank, stats }                                  │
│     ↓                                                        │
│  9. Backend processes:                                      │
│     • Calculate XP/coins                                    │
│     • Update player stats                                   │
│     • Update leaderboard                                    │
│     ↓                                                        │
│  10. Show results to user                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Points

### ✅ Do This

1. **Get sessionId** from matchmaking
2. **Join session** (optional, for tracking)
3. **Run all game logic** in frontend
4. **Submit final result** when game ends

### ❌ Don't Do This

1. ❌ Send dice rolls to backend
2. ❌ Send cargo moves to backend
3. ❌ Sync game state in real-time
4. ❌ Send turn changes to backend

---

## 🎮 Single Player vs Multiplayer

### Single Player (AI Opponent)

```typescript
// No backend needed
// All logic in frontend
// Just submit result at end
```

### Multiplayer (Real Opponent)

```typescript
// Option 1: Keep it simple (recommended)
// - Each player runs game locally
// - Only submit final results
// - Backend doesn't need to sync state

// Option 2: Real-time sync (if needed)
// - Send moves to opponent
// - Sync game state
// - More complex, but not necessary for this game
```

---

## 📝 Minimal Code Changes

### Only 3 Changes Needed:

#### 1. Get Session ID

```typescript
// Add to component
const sessionIdRef = useRef<string | null>(null);

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  if (sessionId) {
    sessionIdRef.current = sessionId;
  }
}, []);
```

#### 2. Submit Result Function

```typescript
const submitGameResult = async (winner: Turn) => {
  if (!sessionIdRef.current) return;
  
  const token = localStorage.getItem('token');
  await fetch(`http://localhost:5001/api/game/session/${sessionIdRef.current}/result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      score: winner === 'player' ? 500 : 100,
      rank: winner === 'player' ? 1 : 2,
      stats: {
        time: 30 - playerTimeLeft,
        winner: winner === 'player'
      }
    })
  });
};
```

#### 3. Call in finalizeGame

```typescript
const finalizeGame = async (winner: Turn, ...) => {
  // ... your existing logic ...
  
  // ADD THIS LINE:
  await submitGameResult(winner);
  
  // ... rest of your logic ...
};
```

---

## 🎯 That's It!

**No other changes needed!**

- ✅ Game logic stays in frontend
- ✅ Only submit final result
- ✅ Backend handles rewards & leaderboard
- ✅ Simple and efficient

---

## 📊 Backend API

### Submit Result Endpoint

```
POST /api/game/session/:id/result

Headers:
  Authorization: Bearer {token}

Body:
{
  "score": 500,
  "rank": 1,
  "stats": {
    "time": 25,
    "winner": true
  }
}

Response:
{
  "success": true,
  "data": {
    "xp": 50,
    "coins": 10,
    "points": 500
  }
}
```

---

## 🔍 What Happens on Backend

When you submit result:

1. **Backend receives** final score, rank, stats
2. **Calculates rewards**:
   - XP based on win/loss
   - Coins based on performance
   - Points for leaderboard
3. **Updates player stats**:
   - Games played +1
   - Wins/Losses updated
   - Total points updated
4. **Updates leaderboard**:
   - Redis cache updated
   - Rankings recalculated
5. **Returns rewards** to frontend

---

## ⚠️ Important Notes

1. **Game Logic = Frontend**: All dice, moves, turns stay in frontend
2. **Backend = Results Only**: Only final result goes to backend
3. **No Real-time Sync Needed**: Each player can run game locally
4. **Simple & Efficient**: Less data, faster, simpler

---

## 🎮 Example: Complete Minimal Integration

```typescript
// Your existing CargoPush component
export function CargoPush({ players, onGameEnd, onHome, onLeaderboard }: CargoPushProps) {
  // ... all your existing state (NO CHANGES) ...
  
  // ADD THIS:
  const sessionIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    sessionIdRef.current = urlParams.get('sessionId');
  }, []);

  // ADD THIS:
  const submitGameResult = async (winner: Turn) => {
    if (!sessionIdRef.current) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5001/api/game/session/${sessionIdRef.current}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: winner === 'player' ? 500 : 100,
        rank: winner === 'player' ? 1 : 2,
        stats: { time: 30 - playerTimeLeft, winner: winner === 'player' }
      })
    });
  };

  // MODIFY THIS (add one line):
  const finalizeGame = async (winner: Turn, ...) => {
    // ... all your existing logic ...
    await submitGameResult(winner); // ADD THIS LINE
    // ... rest of your logic ...
  };

  // ... rest of your code (NO OTHER CHANGES) ...
}
```

---

## 🔧 Using Existing Services

If you're using the existing `gameService`:

```typescript
import { gameService } from '../api/services/game';

// In submitGameResult:
await gameService.submitResult(
  sessionIdRef.current,
  winner === 'player' ? 500 : 100,  // score
  {
    time: 30 - playerTimeLeft,
    winner: winner === 'player',
    finalPositions: lanePositionsRef.current
  },  // stats
  winner === 'player' ? 1 : 2  // rank
);
```

---

## 📱 Matchmaking Integration

### In Matchmaking Component

```typescript
// When match is found
const handleMatchFound = (sessionId: string, opponentId: string) => {
  // Navigate to game with sessionId
  setCurrentScreen('cargo');
  // Or use router:
  // router.push(`/game?sessionId=${sessionId}`);
  
  // Store sessionId for later use
  setMatchSessionId(sessionId);
};
```

### In App.tsx

```typescript
// Already implemented in handleMatchFound
const handleMatchFound = async (sessionId: string, opponentId: string) => {
  setMatchSessionId(sessionId);
  // ... existing code ...
  const gameType = gameTypeMap[response.data.gameType] || 'rope';
  setCurrentGame(gameType);
  setCurrentScreen(gameType);
  // CargoPush will get sessionId from URL or props
};
```

---

## 🎯 Summary

**Integration Steps:**

1. ✅ Get `sessionId` from matchmaking (already done in App.tsx)
2. ✅ Pass `sessionId` to CargoPush component (via URL or props)
3. ✅ Submit result when game ends (add 3 lines of code)

**That's it!** Game logic stays in frontend, backend only handles results.

---

**Дүгнэлт**: Game logic бүгд frontend-д. Backend зөвхөн matchmaking болон final results хүлээн авна. Энэ нь илүү энгийн, хурдан, үр дүнтэй.

