import type { EstadoPedido } from "../../features/pedidos/types/pedido";

const estilos: Record<EstadoPedido, { clase: string; texto: string }> = {
  PENDIENTE: { clase: "bg-amber-100 text-amber-800", texto: "Pendiente" },
  EN_PREPARACION: { clase: "bg-blue-100 text-blue-800", texto: "En preparación" },
  ENTREGADO: { clase: "bg-green-100 text-green-800", texto: "Entregado" },
  CANCELADO: { clase: "bg-slate-200 text-slate-700", texto: "Cancelado" },
};

export default function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, texto } = estilos[estado];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${clase}`}>
      {texto}
    </span>
  );
}
