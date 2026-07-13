"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { onAuthChange, signOut as supabaseSignOut } from "@/lib/services/auth";
import type { AuthUser } from "@/types/db";

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isGuest, isLoading, setUser, setGuest, logout: storeLogout } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const isGuestRef = useRef(isGuest);

  // Keep ref in sync to avoid stale closure in onAuthChange callback
  useEffect(() => {
    isGuestRef.current = isGuest;
  }, [isGuest]);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) {
        setUser(u);
      } else if (!isGuestRef.current) {
        // Only clear loading state, don't clear user (avoid flicker)
        useAuthStore.getState().setLoading(false);
      }
    });
    return unsub;
  }, [refreshKey, setUser]);

  const logout = async () => {
    await supabaseSignOut();
    storeLogout();
  };

  const refreshUser = () => setRefreshKey((k) => k + 1);

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
