import { api } from "../../../shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/pedidos", datos);
  return data;
}

// Propios (user) o todos (admin): lo decide el backend según la sesión
export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>("/pedidos", { params: filtros });
  return data;
}

export async function getPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}
