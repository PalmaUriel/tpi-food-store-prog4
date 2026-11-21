import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { detailDe, statusDe } from "./handleApiError";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  // El navegador adjunta la cookie HttpOnly en cada petición (y acepta la del login).
  // El frontend nunca lee ni guarda el token.
  withCredentials: true,
});

const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";
// En estas rutas un 401 es una respuesta "normal": credenciales incorrectas, o la
// comprobación de sesión al iniciar la app. No significa que una sesión haya vencido.
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

// Interceptor de respuesta: maneja la sesión vencida o la cuenta desactivada de forma global
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = statusDe(error);
    const url = axios.isAxiosError(error) ? (error.config?.url ?? "") : "";
    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((r) => url.includes(r));
    const desactivada = status === 400 && detailDe(error) === CUENTA_DESACTIVADA;

    if (sesionVencida || desactivada) {
      // Sin usuario en el store, ProtectedRoute redirige a /login
      useAuthStore.getState().limpiarSesion();
    }
    return Promise.reject(error);
  },
);
