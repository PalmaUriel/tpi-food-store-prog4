import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";

// Error con el mensaje del backend ({"detail": ...}) y el código HTTP
export class ApiError extends Error {
  status: number | undefined;

  constructor(mensaje: string, status?: number) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
  }
}

// Forma de los errores de FastAPI: texto (400, 401, 403, 404, 409) o lista (422)
interface ErrorBackend {
  detail?: string | { msg: string }[];
}

function mensajeDeError(error: AxiosError<ErrorBackend>): string {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
  if (!error.response) return "No se pudo conectar con el servidor";
  return `Error ${error.response.status}`;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  // El navegador adjunta la cookie HttpOnly en cada petición (y acepta la del login)
  withCredentials: true,
});

// Interceptor de SOLICITUD: no toca el token. El JWT viaja en la cookie HttpOnly,
// que JavaScript no puede leer: la adjunta el navegador solo (RN-03).
api.interceptors.request.use((config) => config);

// En estas rutas un 401 es una respuesta "normal" (credenciales malas o sin sesión
// al iniciar la app), así que no se trata como una sesión vencida.
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

// Interceptor de RESPUESTA: maneja el 401 de forma global (HU-07)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBackend>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta))) {
      // Sesión vencida o inválida: se limpia el store y ProtectedRoute redirige a /login
      useAuthStore.getState().limpiarSesion();
    }

    return Promise.reject(new ApiError(mensajeDeError(error), status));
  },
);