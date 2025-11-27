// Authentication
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    player: {
      id: string;
      username: string;
      email: string;
      level?: number;
      totalPoints?: number;
    };
    token: string;
  };
}

// Player
export interface Player {
  id: string;
  username: string;
  email: string;
  avatar: {
    imageUrl: string;
    frameId?: string;
  };
  level: number;
  xp: number;
  totalPoints: number;
  rank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  coins: number;
}

export interface PlayerStats {
  gameType: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  averageScore: number;
  bestScore: number;
}

// Challenge
export interface Challenge {
  challengeId: string;
  type: 'play_games' | 'win_games' | 'score_points' | 'streak' | 'special';
  gameType?: 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance';
  title: string;
  description: string;
  requirement: {
    field: string;
    value: number;
  };
  reward: {
    coins: number;
    xp: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeProgress extends Challenge {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyChallenge {
  challenges: ChallengeProgress[];
}

// Game
export interface GameSession {
  _id: string;
  gameType: string;
  mode: string;
  players: Array<{
    playerId: string;
    username: string;
    avatar: string;
  }>;
  status: 'waiting' | 'countdown' | 'active' | 'finished' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  winnerId?: string;
}

export interface GameResult {
  _id: string;
  sessionId: string;
  playerId: string;
  gameType: string;
  score: number;
  rank: number;
  pointsEarned: number;
  xpEarned: number;
  stats: Record<string, any>;
  rewards: {
    coins: number;
    seasonPassXp: number;
  };
}

// Leaderboard
export interface LeaderboardEntry {
  playerId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

// Tournament
export interface Tournament {
  _id: string;
  name: string;
  gameType: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'registration' | 'active' | 'finished' | 'cancelled';
  participants: Array<{
    playerId: string;
    registeredAt: string;
  }>;
}

export interface Bracket {
  rounds: Array<{
    round: number;
    matches: Array<{
      matchId: string;
      player1?: string;
      player2?: string;
      winner?: string;
    }>;
  }>;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

