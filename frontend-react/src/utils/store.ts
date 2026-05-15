import { create } from 'zustand';
import { User } from '../types';
import { Case, Alert } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('access_token', token);
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('access_token');
      set({ token: null, isAuthenticated: false, user: null });
    }
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));

interface CaseStore {
  currentCase: Case | null;
  cases: Case[];
  setCurrentCase: (caseData: Case | null) => void;
  setCases: (cases: Case[]) => void;
}

export const useCaseStore = create<CaseStore>((set) => ({
  currentCase: null,
  cases: [],
  setCurrentCase: (caseData) => set({ currentCase: caseData }),
  setCases: (cases) => set({ cases }),
}));

interface AlertStore {
  alerts: Alert[];
  unreadCount: number;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (alertId: string) => void;
  setUnreadCount: (count: number) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  unreadCount: 0,
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  removeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

interface UiStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  toggleDarkMode: () =>
    set((state) => {
      localStorage.setItem('darkMode', String(!state.darkMode));
      return { darkMode: !state.darkMode };
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
