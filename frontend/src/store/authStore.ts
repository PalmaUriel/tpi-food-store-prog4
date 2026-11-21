import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as authService from "../services/auth";
import type { UserPublicResponse, UsuarioAuth } from "../types/auth.types";

interface AuthState {
  // ---------- Estado ----------
  user: UsuarioAuth | null; // null = sin sesión. NUNCA se guarda el token (RN-03)
  isLoading: boolean; // true mientras se confirma la sesión con /auth/me

  // ---------- Acciones ----------
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

// Se queda solo con lo que define UsuarioAuth (descarta celular, etc.)
function aUsuarioAuth({ id, nombre, apellido, email, roles }: UserPublicResponse): UsuarioAuth {
  return { id, nombre, apellido, email, roles };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      // POST /auth/token (el navegador guarda la cookie) y luego GET /auth/me
      login: async (email, password) => {
        await authService.login({ email, password });
        const me = await authService.getMe();
        set({ user: aUsuarioAuth(me), isLoading: false });
      },

      // POST /auth/logout (borra la cookie) y limpia el store aunque la petición falle
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ user: null });
        }
      },

      // Al iniciar la app: ¿la cookie sigue siendo válida? (HU-04)
      checkSession: async () => {
        set({ isLoading: true });
        try {
          const me = await authService.getMe();
          set({ user: aUsuarioAuth(me), isLoading: false });
        } catch {
          set({ user: null, isLoading: false });
        }
      },

      // La usa el interceptor de Axios ante un 401
      limpiarSesion: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Solo se persisten los datos del usuario: ni isLoading ni las funciones
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

// Selector derivado: ¿el usuario tiene el rol admin?
export const useEsAdmin = () =>
  useAuthStore((state) => state.user?.roles.includes("admin") ?? false);