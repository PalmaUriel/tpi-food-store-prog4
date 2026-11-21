import { QueryClient } from "@tanstack/react-query";
import { statusDe } from "./handleApiError";

// Instancia única de TanStack Query para toda la aplicación
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s: evita volver a pedir lo mismo al navegar entre pantallas
      refetchOnWindowFocus: false,
      // No reintenta los errores del cliente (401, 403, 404...): reintentar no los arregla
      retry: (fallos, error) => {
        const status = statusDe(error);
        return status === undefined || status >= 500 ? fallos < 2 : false;
      },
    },
  },
});
