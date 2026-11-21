import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria";

export const categoriasKey = ["categorias"] as const;

export function useCategorias() {
  return useQuery({ queryKey: categoriasKey, queryFn: getCategorias });
}

// Al cambiar una categoría se invalidan también los productos: cada uno muestra la suya
function useInvalidarCatalogo() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: categoriasKey });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => crearCategoria(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) =>
      actualizarCategoria(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCatalogo();
  return useMutation({ mutationFn: (id: number) => eliminarCategoria(id), onSuccess: invalidar });
}
