// Forma común de los listados paginados del backend: { "total": N, "items": [...] }
export interface Paginado<T> {
  total: number;
  items: T[];
}
