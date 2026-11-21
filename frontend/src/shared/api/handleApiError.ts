import { isAxiosError } from "axios";

// Forma de los errores de FastAPI: texto (400, 401, 403, 404, 409) o lista de errores (422)
interface ErrorBackend {
  detail?: string | { msg: string; loc?: (string | number)[] }[];
}

/** Convierte cualquier error (de Axios o no) en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (isAxiosError<ErrorBackend>(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
    return `Error ${error.response.status}`;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado";
}

/** Código HTTP del error, si vino del servidor. */
export function statusDe(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** Texto del campo detail, si vino del servidor. */
export function detailDe(error: unknown): string | undefined {
  if (!isAxiosError<ErrorBackend>(error)) return undefined;
  const detail = error.response?.data?.detail;
  return typeof detail === "string" ? detail : undefined;
}
