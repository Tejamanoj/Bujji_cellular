import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, name?: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  updateProfileImage: (url: string) => void;
  updateLoyaltyPoints: (points: number) => void;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user_1',
    name: 'Teja M',
    email: 'tejam@example.com',
    profileImage: '/images/avatar-placeholder.svg',
    loyaltyPoints: 1250,
  },
  token: 'mock_jwt_token_bujji_cellulars',
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (email, name) => {
    set({ isLoading: true, error: null });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const mockUser: User = {
        id: 'user_1',
        name: name || 'Teja M',
        email: email,
        profileImage: '/images/avatar-placeholder.svg',
        loyaltyPoints: 1250,
      };
      set({
        user: mockUser,
        token: 'mock_jwt_token_bujji_cellulars',
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      set({ error: 'Invalid credentials', isLoading: false });
      return false;
    }
  },

  signup: async (name, email) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        profileImage: '/images/avatar-placeholder.svg',
        loyaltyPoints: 100, // Sign up bonus
      };
      set({
        user: mockUser,
        token: 'mock_jwt_token_bujji_cellulars',
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      set({ error: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  updateProfileImage: (url) => {
    set((state) => ({
      user: state.user ? { ...state.user, profileImage: url } : null,
    }));
  },

  updateLoyaltyPoints: (points) => {
    set((state) => ({
      user: state.user ? { ...state.user, loyaltyPoints: state.user.loyaltyPoints + points } : null,
    }));
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ isLoading: false });
    return true;
  },

  clearError: () => set({ error: null }),
}));
