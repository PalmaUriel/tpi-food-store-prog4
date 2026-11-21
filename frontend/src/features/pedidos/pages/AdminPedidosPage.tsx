import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import Titulo from "../../../shared/components/Titulo";
import { formatFecha, formatPrecio } from "../../../shared/utils/formato";
import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Modal from "../../../shared/ui/Modal";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCambiarEstadoPedido, usePedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from "../types/pedido";

const SIN_DATOS: Pedido[] = [];
const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

const columnHelper = createColumnHelper<Pedido>();
const columnas = [
  columnHelper.accessor("id", { header: "#" }),
  columnHelper.accessor("created_at", { header: "Fecha", cell: (c) => formatFecha(c.getValue()) }),
  columnHelper.accessor("usuario_id", { header: "Cliente (id)" }),
  columnHelper.accessor("direccion_entrega", { header: "Dirección" }),
  columnHelper.accessor("forma_pago", { header: "Pago" }),
  columnHelper.accessor("total", { header: "Total", cell: (c) => formatPrecio(c.getValue()) }),
  columnHelper.accessor("estado", { header: "Estado", cell: (c) => <BadgeEstado estado={c.getValue()} /> }),
];

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  // El panel pide hasta 100 y TanStack Table pagina en el navegador
  const { data, isLoading, error } = usePedidos({ skip: 0, limit: 100, estado });
  const detalle = usePedido(seleccionado);
  const cambiarEstado = useCambiarEstadoPedido();

  const table = useReactTable({
    data: data?.items ?? SIN_DATOS,
    columns: columnas,
    getRowId: (p) => String(p.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const aplicar = (pedido: Pedido, nuevo: EstadoPedido) => {
    if (nuevo === "CANCELADO" && !confirm(`¿Cancelar el pedido #${pedido.id}? Se restituye el stock.`)) {
      return;
    }
    cambiarEstado.mutate({ id: pedido.id, estado: nuevo });
  };

  return (
    <>
      <Titulo
        acciones={
          <select
            aria-label="Filtrar por estado"
            value={estado ?? ""}
            onChange={(e) => setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        }
      >
        Pedidos
      </Titulo>

      {cambiarEstado.error && (
        <div className="mb-4">
          <EstadoError mensaje={handleApiError(cambiarEstado.error)} />
        </div>
      )}

      <DataTable
        table={table}
        cargando={isLoading}
        error={error ? handleApiError(error) : null}
        mensajeVacio="No hay pedidos con ese estado."
        renderAcciones={(pedido) => (
          <div className="flex justify-end gap-1">
            <Button variante="texto" onClick={() => setSeleccionado(pedido.id)}>
              Detalle
            </Button>
            {/* Solo los botones que permite la máquina de estados (RN-02) */}
            {TRANSICIONES[pedido.estado].map((nuevo) => (
              <Button
                key={nuevo}
                variante={nuevo === "CANCELADO" ? "secundario" : "primario"}
                disabled={cambiarEstado.isPending}
                onClick={() => aplicar(pedido, nuevo)}
              >
                {TEXTO_ACCION[nuevo]}
              </Button>
            ))}
          </div>
        )}
      />

      <Modal
        abierto={seleccionado !== null}
        titulo={`Pedido #${seleccionado ?? ""}`}
        onCerrar={() => setSeleccionado(null)}
        ancho="lg"
      >
        {detalle.isLoading ? (
          <SkeletonFilas filas={3} />
        ) : (
          detalle.data && <PedidoDetalle pedido={detalle.data} />
        )}
      </Modal>
    </>
  );
}
