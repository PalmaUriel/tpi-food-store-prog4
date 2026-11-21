// Usuario autenticado tal como lo guarda el AuthStore (sin token, RN-03)
export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[]; // nombres de los roles vigentes: "admin", "user"
}

// ---------- Peticiones ----------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  password: string;
}

// ---------- Respuestas del backend ----------

// POST /auth/register y GET /auth/me (UserPublic)
export interface UserPublicResponse extends UsuarioAuth {
  celular: string | null;
}

// GET /auth/admin/usuarios (UserAdmin)
export interface UsuarioAdmin extends UserPublicResponse {
  activo: boolean;
  deleted_at: string | null;
}

// POST /auth/token y POST /auth/logout
export interface MensajeResponse {
  mensaje: string;
}