import { api } from "../api/axiosInstance";
import type {
  LoginCredentials,
  MensajeResponse,
  RegisterData,
  UserPublicResponse,
  UsuarioAdmin,
} from "../types/auth.types";

export async function register(datos: RegisterData): Promise<UserPublicResponse> {
  const { data } = await api.post<UserPublicResponse>("/auth/register", datos);
  return data;
}

// /auth/token espera un FORMULARIO OAuth2 (no JSON) y el email va en el campo "username"
export async function login({ email, password }: LoginCredentials): Promise<MensajeResponse> {
  const form = new URLSearchParams({ username: email, password });
  const { data } = await api.post<MensajeResponse>("/auth/token", form);
  return data; // el token NO viene acá: el navegador guardó la cookie HttpOnly
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await api.post<MensajeResponse>("/auth/logout");
  return data;
}

export async function getMe(): Promise<UserPublicResponse> {
  const { data } = await api.get<UserPublicResponse>("/auth/me");
  return data;
}

// ---------- Administración de usuarios (solo admin) ----------

export async function getUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<UsuarioAdmin[]>("/auth/admin/usuarios");
  return data;
}

export async function activarUsuario(id: number): Promise<UsuarioAdmin> {
  const { data } = await api.post<UsuarioAdmin>(`/auth/admin/usuarios/${id}/activar`);
  return data;
}

export async function desactivarUsuario(id: number): Promise<UsuarioAdmin> {
  const { data } = await api.post<UsuarioAdmin>(`/auth/admin/usuarios/${id}/desactivar`);
  return data;
}