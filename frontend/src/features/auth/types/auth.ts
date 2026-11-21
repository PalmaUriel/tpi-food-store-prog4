export type Rol = "user" | "admin";

// GET /auth/me, POST /auth/register y GET /admin/usuarios (UserPublic del backend)
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Lo que guarda el authStore: nombre, email y rol. Nunca el token.
export interface UsuarioSesion {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// POST /auth/register (UserCreate del backend)
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface Mensaje {
  message: string;
}
