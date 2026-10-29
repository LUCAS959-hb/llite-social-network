import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string; bio?: string }) => Promise<void>;
  logout: () => void;
  demoSwitchUser: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  availableUsers: User[];
  openAuthModal: (mode?: 'login' | 'register' | 'switch' | 'reset', reason?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'switch' | 'reset';
  setAuthModalMode: (mode: 'login' | 'register' | 'switch' | 'reset') => void;
  authPromptReason: string;
  requireAuth: (actionReason: string, callback?: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'llite_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'switch' | 'reset'>('login');
  const [authPromptReason, setAuthPromptReason] = useState<string>('');

  // Stored callback to execute after authentication completes
  const pendingActionRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const users = await api.getUsers();
        setAvailableUsers(users);

        const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUserId) {
          const matched = users.find((u) => u.id === savedUserId);
          if (matched) {
            setCurrentUser(matched);
            setIsLoading(false);
            return;
          }
        }
        // Guest mode by default: Visitors explore LLite without auto-login!
        setCurrentUser(null);
      } catch (err) {
        console.error('Failed to load user', err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const executePendingAction = () => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setAuthPromptReason('');
      try {
        action();
      } catch (err) {
        console.error('Error executing pending action after auth:', err);
      }
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      localStorage.setItem(AUTH_STORAGE_KEY, res.user.id);
      setIsAuthModalOpen(false);
      // Run pending user action after successful login
      setTimeout(() => executePendingAction(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; username: string; email: string; password: string; bio?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setCurrentUser(res.user);
      localStorage.setItem(AUTH_STORAGE_KEY, res.user.id);
      setAvailableUsers((prev) => [...prev.filter((u) => u.id !== res.user.id), res.user]);
      setIsAuthModalOpen(false);
      // Run pending user action after successful registration
      setTimeout(() => executePendingAction(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setIsAuthModalOpen(false);
    setAuthPromptReason('');
    pendingActionRef.current = null;
  };

  const demoSwitchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const users = await api.getUsers();
      setAvailableUsers(users);
      const user = users.find((u) => u.id === userId);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, user.id);
        setIsAuthModalOpen(false);
        setTimeout(() => executePendingAction(), 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = await api.updateProfile({
      userId: currentUser.id,
      ...data,
    });
    setCurrentUser(updated);
    setAvailableUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const openAuthModal = (mode: 'login' | 'register' | 'switch' | 'reset' = 'login', reason: string = '') => {
    setAuthModalMode(mode);
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason('');
    pendingActionRef.current = null;
  };

  /**
   * Intercept guest actions: If user is authenticated, execute callback and return true.
   * If visitor is a guest, record callback, display prompt modal, and return false.
   */
  const requireAuth = (actionReason: string, callback?: () => void): boolean => {
    if (currentUser) {
      if (callback) callback();
      return true;
    }

    pendingActionRef.current = callback || null;
    setAuthPromptReason(actionReason);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        demoSwitchUser,
        updateProfile,
        availableUsers,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authPromptReason,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
