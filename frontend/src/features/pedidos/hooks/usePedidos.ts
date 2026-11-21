import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstado,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumen,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types/pedido";

export const pedidosKey = (filtros: FiltrosPedidos) => ["pedidos", filtros] as const;
export const pedidoKey = (id: number) => ["pedido", id] as const;
export const resumenKey = ["pedidos-resumen"] as const;

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKey(filtros),
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

// Detalle: solo se pide cuando hay un id seleccionado
export function usePedido(id: number | null) {
  return useQuery({
    queryKey: pedidoKey(id ?? 0),
    queryFn: () => getPedido(id ?? 0),
    enabled: id !== null,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: resumenKey, queryFn: getResumen });
}

// Un pedido nuevo o cancelado cambia los listados, el resumen y el STOCK de los productos
function useInvalidarTrasPedido() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    void queryClient.invalidateQueries({ queryKey: ["pedido"] });
    void queryClient.invalidateQueries({ queryKey: resumenKey });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({ mutationFn: (datos: PedidoCreate) => crearPedido(datos), onSuccess: invalidar });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: invalidar });
}
