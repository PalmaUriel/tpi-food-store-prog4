import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as authApi from "../features/auth/api/auth";
import type { UserPublic, UsuarioSesion } from "../features/auth/types/auth";

interface AuthState {
  usuario: UsuarioSesion | null; // null = sin sesión. NUNCA se guarda el token
  cargando: boolean; // true mientras checkSession confirma la sesión con /auth/me

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

function aSesion({ id, username, full_name, email, role }: UserPublic): UsuarioSesion {
  return { id, username, full_name, email, role };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // POST /auth/token (el navegador guarda la cookie) y luego GET /auth/me
      login: async (username, password) => {
        await authApi.login({ username, password });
        const me = await authApi.getMe();
        set({ usuario: aSesion(me), cargando: false });
      },

      // POST /auth/logout (borra la cookie) y limpia el store aunque la petición falle
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null });
        }
      },

      // Al montar la aplicación: ¿la cookie sigue siendo válida?
      checkSession: async () => {
        set({ cargando: true });
        try {
          const me = await authApi.getMe();
          set({ usuario: aSesion(me), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      // La usa el interceptor de Axios ante un 401 o una cuenta desactivada
      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: "foodstore-auth",
      storage: createJSONStorage(() => sessionStorage),
      // Solo se persiste el usuario: ni "cargando" ni las funciones (y nunca un token)
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

// Selectores derivados
export const useEsAdmin = () => useAuthStore((state) => state.usuario?.role === "admin");
