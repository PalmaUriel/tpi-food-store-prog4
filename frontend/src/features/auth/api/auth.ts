import { api } from "../../../shared/api/axiosInstance";
import type { LoginCredentials, Mensaje, UserCreate, UserPublic } from "../types/auth";

export async function register(datos: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>("/auth/register", datos);
  return data;
}

// /auth/token espera un FORMULARIO OAuth2 (no JSON): username y password
export async function login({ username, password }: LoginCredentials): Promise<Mensaje> {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<Mensaje>("/auth/token", form);
  return data; // el token NO viene acá: el navegador guardó la cookie HttpOnly
}

export async function logout(): Promise<Mensaje> {
  const { data } = await api.post<Mensaje>("/auth/logout");
  return data;
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>("/auth/me");
  return data;
}
