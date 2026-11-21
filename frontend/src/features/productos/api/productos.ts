import { api } from "../../../shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto";

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // Axios arma la query string y omite los parámetros undefined
  const { data } = await api.get<ProductosPaginados>("/productos", { params: filtros });
  return data;
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", datos);
  return data;
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
