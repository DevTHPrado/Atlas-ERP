import { create } from "zustand";
import type { AuthenticatedUser } from "@/types/auth.types";

type SessionState = {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  hasHydrated: boolean;
  hydrate: () => void;
  signIn: (token: string, user: AuthenticatedUser) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  hasHydrated: false,
  hydrate: () => {
    if (typeof window !== "undefined") {
      const accessToken = window.localStorage.getItem("accessToken");
      const storedUser = window.localStorage.getItem("user");
      set({
        accessToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        hasHydrated: true,
      });
      return;
    }
    set({ hasHydrated: true });
  },
  signIn: (token, user) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("accessToken", token);
      window.localStorage.setItem("user", JSON.stringify(user));
    }
    set({ accessToken: token, user });
  },
  signOut: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("user");
    }
    set({ accessToken: null, user: null });
  },
}));
