import { create } from 'zustand';
import { User } from '@/types';
import { customerSignIn, customerSignUp, adminSignIn, adminSignOut } from '@/backend/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/backend/firebase';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfileImage: (url: string) => void;
  updateLoyaltyPoints: (points: number) => void;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isAdmin: false,

  login: async (email, password = 'DefaultPassword123') => {
    set({ isLoading: true, error: null });
    
    // Check if it's admin or standard user
    if (email === 'admin@bujjicellulars.com' || email === 'admin@bujjicellular.com') {
      const res = await adminSignIn(email, password);
      if (res.success) {
        const appUser: User = {
          id: res.user!.uid,
          name: 'Administrator',
          email: email,
          profileImage: '/images/avatar-placeholder.svg',
          loyaltyPoints: 0,
        };
        set({
          user: appUser,
          token: 'bujji_admin_token',
          isAuthenticated: true,
          isLoading: false,
          isAdmin: true
        });
        return true;
      } else {
        set({ error: res.error || 'Admin login failed', isLoading: false });
        return false;
      }
    }

    // Standard User login
    const res = await customerSignIn(email, password);
    if (res.success && res.user) {
      set({
        user: res.user,
        token: 'bujji_user_token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false
      });
      return true;
    } else {
      set({ error: res.error || 'Invalid email or password.', isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password = 'DefaultPassword123') => {
    set({ isLoading: true, error: null });
    const res = await customerSignUp(name, email, password);
    if (res.success && res.user) {
      set({
        user: res.user,
        token: 'bujji_user_token',
        isAuthenticated: true,
        isLoading: false,
        isAdmin: false
      });
      return true;
    } else {
      set({ error: res.error || 'Signup failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await adminSignOut();
    set({ user: null, token: null, isAuthenticated: false, error: null, isAdmin: false });
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
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
