"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types/db";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isGuest: boolean;
  rememberMe: boolean;
  setUser: (user: AuthUser | null) => void;
  setGuest: (guest: boolean) => void;
  setLoading: (loading: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isGuest: false,
      rememberMe: false,
      setUser: (user) => set({ user, isGuest: false, isLoading: false }),
      setGuest: (isGuest) =>
        set({
          isGuest,
          user: isGuest
            ? {
                id: "guest-" + Math.random().toString(36).slice(2, 10),
                email: "",
                full_name: "ضيف",
                avatar_url: null,
                role: "user",
                is_guest: true,
              }
            : null,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      logout: () => set({ user: null, isGuest: false, isLoading: false }),
    }),
    {
      name: "alieqa.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.rememberMe ? s.user : null,
        isGuest: s.isGuest,
        rememberMe: s.rememberMe,
      }),
      // Skip hydration to avoid SSR mismatch — client will rehydrate from localStorage
      skipHydration: true,
    }
  )
);
