import { api } from "../api/axiosInstance";
import type { Categoria, CategoriaInput } from "../types/categoria";
import type { PaginatedResponse } from "../types/paginacion";
import { LIMITE_LISTADO } from "./http";

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<PaginatedResponse<Categoria>>("/categorias/", {
    params: { limit: LIMITE_LISTADO },
  });
  return data.items;
}

export async function createCategoria(datos: CategoriaInput): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categorias/", datos);
  return data;
}

export async function updateCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, datos);
  return data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}