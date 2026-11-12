import { create } from 'zustand';
import { api } from '@/lib/api';
import { useProgressStore } from '@/store/progressStore';
import type { User, LoginRequest, RegisterRequest } from '@/lib/types';

interface AuthUserResponse {
  user: User;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateProfile: (data: { username: string; email: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<AuthUserResponse>('/api/auth/login', data);
      set({ user: res.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<AuthUserResponse>('/api/auth/register', data);
      set({ user: res.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await api.post('/api/auth/logout', {}).catch(() => {});
    set({ user: null });
    useProgressStore.getState().reset();
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const user = await api.put<User>('/api/auth/me', data);
      set({ user });
    } finally {
      set({ isLoading: false });
    }
  },

  hydrate: async () => {
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ user });
    } catch {
      set({ user: null });
    }
  },
}));
