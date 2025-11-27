# Backend Integration Guide - Physical Asia Game

## Хурдан эхлэл

### 1. Environment Variables

`.env` файл үүсгэх (project root дээр):

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

### 2. Authentication

```typescript
import { authService } from './api/services/auth';

// Register
const response = await authService.register({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});

// Login
const response = await authService.login({
  email: 'test@example.com',
  password: 'password123'
});

// Check authentication
if (authService.isAuthenticated()) {
  const token = authService.getToken();
  const playerId = authService.getPlayerId();
}
```

### 3. WebSocket Connection

```typescript
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
  }, []);
}
```

### 4. API Services

```typescript
import { gameService } from './api/services/game';
import { leaderboardService } from './api/services/leaderboard';
import { challengeService } from './api/services/challenge';
import { playerService } from './api/services/player';

// Create game session
const session = await gameService.createSession('rope', '1v1');

// Get leaderboard
const leaderboard = await leaderboardService.getGlobal(100);

// Get daily challenges
const challenges = await challengeService.getDaily();

// Get player profile
const profile = await playerService.getProfile(playerId);
```

## Бүтэц

```
src/
├── api/
│   ├── client.ts              # API client (fetch wrapper)
│   └── services/
│       ├── auth.ts            # Authentication service
│       ├── game.ts            # Game service
│       ├── player.ts          # Player service
│       ├── leaderboard.ts     # Leaderboard service
│       └── challenge.ts       # Challenge service
├── websocket/
│   └── client.ts              # WebSocket client
├── hooks/
│   └── useWebSocket.ts        # WebSocket React hook
├── types/
│   └── api.ts                 # TypeScript types
└── utils/
    └── errorHandler.ts        # Error handling utilities
```

## Дэлгэрэнгүй заавар

Backend integration-ийн дэлгэрэнгүй заавар: [Frontend Integration Guide](./docs/FRONTEND_INTEGRATION.md)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Бүртгэх
- `POST /api/auth/login` - Нэвтрэх

### Game
- `POST /api/game/session/create` - Game session үүсгэх
- `GET /api/game/session/:id` - Session мэдээлэл авах
- `POST /api/game/session/:id/result` - Game result илгээх

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/season/:id` - Season leaderboard
- `GET /api/leaderboard/game/:type` - Game type leaderboard
- `GET /api/leaderboard/player/:id/rank` - Player rank
- `GET /api/leaderboard/player/:id/nearby` - Nearby players

### Challenge
- `GET /api/challenge/daily` - Daily challenges
- `GET /api/challenge/progress` - Player progress
- `POST /api/challenge/:id/claim` - Claim reward

### Player
- `GET /api/player/:id` - Player profile
- `GET /api/player/:id/stats` - Player stats
- `PATCH /api/player/:id` - Update profile

## WebSocket Events

### Client → Server
- `game:join` - Game session-д нэгдэх
- `game:leave` - Game session-аас гарах
- `game:update` - Game state шинэчлэх
- `matchmaking:join` - Matchmaking queue-д нэгдэх

### Server → Client
- `player:joined` - Player нэгдсэн
- `player:left` - Player гарсан
- `game:state` - Game state шинэчлэгдсэн
- `game:finished` - Game дууссан
- `matchmaking:queued` - Queue position
- `matchmaking:found` - Match олдсон
- `leaderboard:update` - Leaderboard шинэчлэгдсэн

