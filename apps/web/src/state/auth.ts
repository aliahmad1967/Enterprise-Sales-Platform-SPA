import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@esp/types";
import { repositories } from "@esp/services";

const SESSION_KEY = "esp.session";

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

/** Demo auth provider: seeds a session from the offline directory.
 *  Password equals username for the local demo (documented; the real API
 *  validates against the backend with proper hashing + 2FA-ready flow). */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (username, password) => {
        const users = await repositories.users.getAll();
        const user = users.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.active,
        );
        if (!user) return { ok: false, error: "auth.invalidCredentials" };
        if (password.trim().toLowerCase() !== username.trim().toLowerCase()) {
          return { ok: false, error: "auth.invalidCredentials" };
        }
        set({ user });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: SESSION_KEY, partialize: (s) => ({ user: s.user }) },
  ),
);
