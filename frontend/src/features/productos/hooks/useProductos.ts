import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from "../api/productos";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto";

// Los filtros forman parte de la clave: cada combinación se cachea por separado
export const productosKey = (filtros: FiltrosProductos) => ["productos", filtros] as const;

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKey(filtros),
    queryFn: () => getProductos(filtros),
    // Mientras llega la página nueva se sigue mostrando la anterior (sin parpadeo)
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  // ["productos"] invalida TODAS las combinaciones de filtros a la vez
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) =>
      actualizarProducto(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: (id: number) => eliminarProducto(id), onSuccess: invalidar });
}
