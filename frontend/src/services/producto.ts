import { api } from "../api/axiosInstance";
import type { PaginatedResponse } from "../types/paginacion";
import type { Producto, ProductoInput } from "../types/producto";
import { LIMITE_LISTADO } from "./http";

export async function getProductos(): Promise<Producto[]> {
  const { data } = await api.get<PaginatedResponse<Producto>>("/productos/", {
    params: { limit: LIMITE_LISTADO },
  });
  return data.items;
}

export async function createProducto(datos: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos/", datos);
  return data;
}

export async function updateProducto(id: number, datos: ProductoInput): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}