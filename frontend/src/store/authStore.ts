import { create } from 'zustand';
import { login, signup, getMe } from '../api';

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  loginUser: (username: string, password: string) => Promise<void>;
  signupUser: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  loginUser: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await login({ username, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  signupUser: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await signup({ email, username, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Signup failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await getMe();
      set({
        user: response.data,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('access_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));
