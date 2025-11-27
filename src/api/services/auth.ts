import { apiClient } from '../client';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../../types/api';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/api/auth/register', data);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('playerId', response.data.player.id);
    }
    return response as AuthResponse;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/api/auth/login', data);
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('playerId', response.data.player.id);
    }
    return response as AuthResponse;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('playerId');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getPlayerId(): string | null {
    return localStorage.getItem('playerId');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

