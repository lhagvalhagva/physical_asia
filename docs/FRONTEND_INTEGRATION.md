# Frontend Integration Guide - Physical Asia Game Backend

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Authentication](#authentication)
4. [API Client Setup](#api-client-setup)
5. [API Endpoints](#api-endpoints)
6. [WebSocket Integration](#websocket-integration)
7. [Error Handling](#error-handling)
8. [Example Code](#example-code)
9. [TypeScript Types](#typescript-types)
10. [Best Practices](#best-practices)

---

## Overview

Physical Asia Game Backend нь:
- **Base URL**: `http://localhost:5000` (development) (or 5001)
- **API Prefix**: `/api`
- **WebSocket URL**: `http://localhost:5000` (or 5001)
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON

### Response Structure

Бүх API response дараах форматтай:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: string
}
```

---

## Environment Setup

### 1. Environment Variables

Frontend `.env` файлд:

```env
# Backend API
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

### 2. CORS Configuration

Backend нь бүх origin-д зөвшөөрөгдсөн (development). Production дээр тодорхой origin-уудыг зөвшөөрөх хэрэгтэй.

---

## Authentication

### 1. Register

**Endpoint:** `POST /api/auth/register`

**Request:**
```typescript
interface RegisterRequest {
  username: string;
  email: string;
  password: string; // min 6 characters
}
```

**Response:**
```typescript
interface RegisterResponse {
  success: true;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
    };
    token: string; // JWT token
  };
}
```

**Example:**
```typescript
import { authService } from './api/services/auth';

const response = await authService.register({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});

if (response.success) {
  // Token already saved in localStorage
  console.log('Registered:', response.data.player);
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  success: true;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
      level: number;
      totalPoints: number;
    };
    token: string;
  };
}
```

**Example:**
```typescript
import { authService } from './api/services/auth';

const response = await authService.login({
  email: 'test@example.com',
  password: 'password123'
});

if (response.success) {
  // Token already saved in localStorage
  console.log('Logged in:', response.data.player);
}
```

### 3. Token Management

**Token хадгалах:**
```typescript
import { authService } from './api/services/auth';

// Token автоматаар хадгалагдана (authService.login/register)
// Гэхдээ manual хийх бол:
localStorage.setItem('token', token);
localStorage.setItem('playerId', playerId);
```

**Token авах:**
```typescript
const token = authService.getToken();
const playerId = authService.getPlayerId();
```

**Token устгах:**
```typescript
authService.logout();
```

**Authentication шалгах:**
```typescript
if (authService.isAuthenticated()) {
  // User logged in
}
```

---

## API Client Setup

### Using API Client

```typescript
import { apiClient } from './api/client';

// GET request
const response = await apiClient.get<Player>('/api/player/123');

// POST request
const response = await apiClient.post<GameSession>('/api/game/session/create', {
  gameType: 'rope',
  mode: '1v1'
});
```

### Using Services

```typescript
import { gameService } from './api/services/game';
import { leaderboardService } from './api/services/leaderboard';
import { challengeService } from './api/services/challenge';
import { playerService } from './api/services/player';

// Services provide typed methods
const session = await gameService.createSession('rope', '1v1');
const leaderboard = await leaderboardService.getGlobal(100);
const challenges = await challengeService.getDaily();
const profile = await playerService.getProfile(playerId);
```

---

## API Endpoints

### Authentication

#### Register
```typescript
POST /api/auth/register
Body: { username, email, password }
Response: { success, data: { player, token } }
```

#### Login
```typescript
POST /api/auth/login
Body: { email, password }
Response: { success, data: { player, token } }
```

### Player

#### Get Player Profile
```typescript
GET /api/player/:id
Headers: { Authorization: Bearer {token} }
Response: { success, data: Player }
```

#### Get Player Stats
```typescript
GET /api/player/:id/stats
Headers: { Authorization: Bearer {token} }
Response: { success, data: PlayerStats[] }
```

#### Update Player Profile
```typescript
PATCH /api/player/:id
Headers: { Authorization: Bearer {token} }
Body: { avatar }
Response: { success, data: Player }
```

### Game

#### Create Game Session
```typescript
POST /api/game/session/create
Headers: { Authorization: Bearer {token} }
Body: { gameType, mode, seasonId }
Response: { success, data: GameSession }
```

#### Get Session Details
```typescript
GET /api/game/session/:id
Headers: { Authorization: Bearer {token} }
Response: { success, data: GameSession }
```

#### Submit Game Result
```typescript
POST /api/game/session/:id/result
Headers: { Authorization: Bearer {token} }
Body: { score, stats, rank }
Response: { success, data: GameResult }
```

### Daily Challenge

#### Get Daily Challenges
```typescript
GET /api/challenge/daily
Headers: { Authorization: Bearer {token} }
Response: { success, data: DailyChallenge }
```

#### Get Player Progress
```typescript
GET /api/challenge/progress
Headers: { Authorization: Bearer {token} }
Response: { success, data: ChallengeProgress[] }
```

#### Claim Reward
```typescript
POST /api/challenge/:id/claim
Headers: { Authorization: Bearer {token} }
Response: { success, message: 'Reward claimed' }
```

### Leaderboard

#### Get Global Leaderboard
```typescript
GET /api/leaderboard/global?limit=100&redis=true
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Season Leaderboard
```typescript
GET /api/leaderboard/season/:id?limit=100
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Game Leaderboard
```typescript
GET /api/leaderboard/game/:type?limit=100
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

#### Get Player Rank
```typescript
GET /api/leaderboard/player/:id/rank?redis=true
Headers: { Authorization: Bearer {token} }
Response: { success, data: { rank: number } }
```

#### Get Nearby Players
```typescript
GET /api/leaderboard/player/:id/nearby
Headers: { Authorization: Bearer {token} }
Response: { success, data: LeaderboardEntry[] }
```

---

## WebSocket Integration

### Socket.IO Client Setup

Socket.IO client аль хэдийн суулгагдсан байна (`socket.io-client`).

### Connection

```typescript
// websocket/client.ts - аль хэдийн үүсгэгдсэн
import { wsClient } from './websocket/client';
import { authService } from './api/services/auth';

const token = authService.getToken();
if (token) {
  wsClient.connect(token);
}
```

### React Hook Example

```typescript
// hooks/useWebSocket.ts - аль хэдийн үүсгэгдсэн
import { useWebSocket } from './hooks/useWebSocket';
import { authService } from './api/services/auth';

function MyComponent() {
  const token = authService.getToken();
  const wsClient = useWebSocket(token);

  useEffect(() => {
    wsClient.onGameState((data) => {
      console.log('Game state:', data);
    });

    wsClient.onGameFinished((data) => {
      console.log('Game finished:', data);
    });

    return () => {
      // Cleanup handled by hook
    };
  }, []);
}
```

### WebSocket Events

#### Client → Server

```typescript
// Join game session
wsClient.joinGame(sessionId, playerId);

// Leave game session
wsClient.leaveGame(sessionId, playerId);

// Update game state
wsClient.updateGameState(sessionId, playerId, state);

// Join matchmaking queue
wsClient.joinMatchmaking(playerId, 'rope', '1v1');
```

#### Server → Client

```typescript
// Player joined
wsClient.onPlayerJoined((data) => {
  console.log('Player joined:', data);
});

// Player left
wsClient.onPlayerLeft((data) => {
  console.log('Player left:', data);
});

// Game state update
wsClient.onGameState((data) => {
  console.log('Game state:', data);
});

// Game finished
wsClient.onGameFinished((data) => {
  console.log('Game finished:', data);
});

// Matchmaking queued
wsClient.onMatchmakingQueued((data) => {
  console.log('Queue position:', data.position);
});

// Match found
wsClient.onMatchmakingFound((data) => {
  console.log('Match found:', data);
});

// Leaderboard update
wsClient.onLeaderboardUpdate((data) => {
  console.log('Leaderboard updated:', data);
});
```

---

## Error Handling

### API Error Handler

```typescript
// utils/errorHandler.ts - аль хэдийн үүсгэгдсэн
import { ApiError } from './utils/errorHandler';

try {
  const response = await apiClient.get('/api/player/123');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
    if (error.status === 401) {
      // Unauthorized - logout
      authService.logout();
      window.location.href = '/login';
    }
  }
}
```

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx - аль хэдийн үүсгэгдсэн
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

---

## Example Code

### Complete React Example

```typescript
// App.tsx
import React, { useState, useEffect } from 'react';
import { challengeService } from './api/services/challenge';
import { useWebSocket } from './hooks/useWebSocket';
import { authService } from './api/services/auth';
import type { ChallengeProgress } from './types/api';

function App() {
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = authService.getToken();
  const wsClient = useWebSocket(token);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getDaily();

      if (response.success && response.data) {
        setChallenges(response.data.challenges);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      await challengeService.claimReward(challengeId);
      loadChallenges(); // Refresh
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Daily Challenges</h1>
      {challenges.map((challenge) => (
        <div key={challenge.challengeId}>
          <h3>{challenge.title}</h3>
          <p>{challenge.description}</p>
          <p>Progress: {challenge.progress}</p>
          {challenge.completed && !challenge.claimed && (
            <button onClick={() => claimReward(challenge.challengeId)}>
              Claim Reward
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
```

---

## TypeScript Types

Бүх TypeScript types `src/types/api.ts` файлд байна:

- `RegisterRequest`, `LoginRequest`, `AuthResponse`
- `Player`, `PlayerStats`
- `Challenge`, `ChallengeProgress`, `DailyChallenge`
- `GameSession`, `GameResult`
- `LeaderboardEntry`
- `Tournament`, `Bracket`
- `ApiResponse<T>`

---

## Best Practices

### 1. Token Refresh

```typescript
// Token 7 хоног хүчинтэй. Хэрэв хүчингүй бол дахин login хийх
if (error.status === 401) {
  authService.logout();
  window.location.href = '/login';
}
```

### 2. Request Retry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Request failed after retries');
}
```

### 3. Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleRequest = async () => {
  setLoading(true);
  setError(null);
  try {
    // API call
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Optimistic Updates

```typescript
// UI-г шууд шинэчлэх, дараа нь server-тэй sync хийх
const claimReward = async (challengeId: string) => {
  // Optimistic update
  setChallenges(prev => prev.map(c => 
    c.challengeId === challengeId 
      ? { ...c, claimed: true }
      : c
  ));

  try {
    await challengeService.claimReward(challengeId);
  } catch (err) {
    // Rollback on error
    loadChallenges();
  }
};
```

### 5. WebSocket Reconnection

```typescript
const wsClient = useWebSocket(token);

useEffect(() => {
  const socket = wsClient.getSocket();
  socket?.on('disconnect', () => {
    // Auto reconnect after 1 second
    setTimeout(() => {
      const token = authService.getToken();
      if (token) {
        wsClient.connect(token);
      }
    }, 1000);
  });
}, []);
```

---

## Production Checklist

- [ ] Environment variables тохируулах
- [ ] CORS origin-уудыг тодорхойлох
- [ ] HTTPS ашиглах
- [ ] Token refresh механизм нэмэх
- [ ] Error logging (Sentry, etc.)
- [ ] API rate limiting харгалзах
- [ ] WebSocket reconnection логик
- [ ] Loading states
- [ ] Error boundaries
- [ ] TypeScript types бүхэлд нь

---

## Support

Асуулт байвал:
- Swagger UI: `http://localhost:5000/api-docs`
- API Documentation: `http://localhost:5000/api-docs.json`
- Health Check: `http://localhost:5000/health`

