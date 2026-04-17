import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any | null;
  isHydrated: boolean; // 🔥 tambah ini
  setAuth: (token: string, user: any) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,

      setAuth: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true); // 🔥 ini kunci
      },
    }
  )
);