# Frontend Integration Package

## 📦 Files to Give to Frontend Team

### 🎯 **MAIN FILE (Required)**

#### 1. **[CARGO_PUSH_SIMPLE_INTEGRATION.md](./CARGO_PUSH_SIMPLE_INTEGRATION.md)** ⭐

**Purpose**: Complete integration guide for Cargo Push game  

**Contains**:

- Simple approach (game logic in frontend, only results to backend)
- Step-by-step code examples
- Minimal changes needed (only 3 steps)
- Complete working examples

**Use this for**: Cargo Push game integration

---

### 📚 **SUPPLEMENTARY FILES (Optional but Helpful)**

#### 2. **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)**

**Purpose**: General frontend integration guide  

**Contains**:

- API endpoints overview
- WebSocket integration
- Authentication flow
- Error handling
- TypeScript types

**Use this for**: Understanding overall backend API structure

---

#### 3. **[MATCHMAKING_INTEGRATION_GUIDE.md](./MATCHMAKING_INTEGRATION_GUIDE.md)**

**Purpose**: Detailed matchmaking guide  

**Contains**:

- Matchmaking flow
- WebSocket events
- Queue management
- Session creation

**Use this for**: Understanding matchmaking system

---

#### 4. **[BACKEND_CHANGES_FOR_CARGO_PUSH.md](./BACKEND_CHANGES_FOR_CARGO_PUSH.md)**

**Purpose**: Backend changes summary  

**Contains**:

- What changed in backend
- New gameType: `'cargo-push'`
- API compatibility

**Use this for**: Understanding backend capabilities

---

## 🎮 Quick Start for Frontend

### Step 1: Read Main Guide

👉 **[CARGO_PUSH_SIMPLE_INTEGRATION.md](./CARGO_PUSH_SIMPLE_INTEGRATION.md)**

### Step 2: Integration Checklist

1. ✅ Get sessionId from matchmaking
2. ✅ Submit final result when game ends
3. ✅ Done!

### Step 3: Code Example

```typescript
// 1. Matchmaking
socket.emit('matchmaking:join', {
  playerId: '...',
  gameType: 'cargo-push',
  mode: '1v1'
});

// 2. Get sessionId from matchmaking:found event
// Navigate to: /game?sessionId=xxx

// 3. Submit result when game ends
POST /api/game/session/:sessionId/result
{
  score: 500,
  rank: 1,
  stats: { time: 25, winner: true }
}
```

---

## 📋 What Frontend Needs

### Required Information:

1. **Backend URL**: `http://localhost:5001` (dev) or production URL
2. **WebSocket URL**: `http://localhost:5001` (dev) or production URL
3. **Authentication**: JWT token from login/register
4. **Game Type**: `'cargo-push'`

### API Endpoints:

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/game/session/:id/result` - Submit game result
- WebSocket: `matchmaking:join` - Find opponent
- WebSocket: `matchmaking:found` - Opponent found

---

## 🔗 File Links

### Main Integration:

- **[CARGO_PUSH_SIMPLE_INTEGRATION.md](./CARGO_PUSH_SIMPLE_INTEGRATION.md)** - ⭐ Start here

### Reference:

- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - General API guide
- **[MATCHMAKING_INTEGRATION_GUIDE.md](./MATCHMAKING_INTEGRATION_GUIDE.md)** - Matchmaking details
- **[BACKEND_CHANGES_FOR_CARGO_PUSH.md](./BACKEND_CHANGES_FOR_CARGO_PUSH.md)** - Backend changes

---

## 📝 Summary

**Give to Frontend**:

1. ✅ **CARGO_PUSH_SIMPLE_INTEGRATION.md** (main file)
2. ✅ Backend URL and WebSocket URL
3. ✅ Authentication token (from login)

**That's it!** Everything else is in the guide.

---

## 🚀 Quick Integration (3 Steps)

1. **Matchmaking**: Use `gameType: 'cargo-push'`
2. **Get Session**: Use sessionId from matchmaking
3. **Submit Result**: When game ends

**All details in**: [CARGO_PUSH_SIMPLE_INTEGRATION.md](./CARGO_PUSH_SIMPLE_INTEGRATION.md)

