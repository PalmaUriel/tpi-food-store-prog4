// Forma de las respuestas de listado del backend (GET /categorias/, /productos/)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}