import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  updateProfile: (data: { username: string; email: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<AuthResponse>('/api/auth/login', data);
      localStorage.setItem('token', res.token);
      set({ user: res.user, token: res.token });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<AuthResponse>('/api/auth/register', data);
      localStorage.setItem('token', res.token);
      set({ user: res.user, token: res.token });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  updateProfile: async (data: { username: string; email: string }) => {
    set({ isLoading: true });
    try {
      const user = await api.put<User>('/api/auth/me', data);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  hydrate: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ user, token });
    } catch {
      localStorage.removeItem('token');
    }
  },
}));
