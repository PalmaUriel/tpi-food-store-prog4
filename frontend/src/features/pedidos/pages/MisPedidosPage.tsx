import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import Titulo from "../../../shared/components/Titulo";
import { formatFecha, formatPrecio } from "../../../shared/utils/formato";
import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Modal from "../../../shared/ui/Modal";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido, usePedido, usePedidos } from "../hooks/usePedidos";

const LIMITE = 10;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const nuevoPedido = (useLocation().state as { nuevoPedido?: number } | null)?.nuevoPedido;

  // El backend devuelve solo los pedidos del usuario de la sesión (RN-04)
  const { data, isLoading, error } = usePedidos({ skip: pagina * LIMITE, limit: LIMITE });
  const detalle = usePedido(seleccionado);
  const cancelar = useCancelarPedido();

  const confirmarCancelacion = (id: number) => {
    if (confirm(`¿Cancelar el pedido #${id}? El stock se devuelve al catálogo.`)) {
      cancelar.mutate(id);
    }
  };

  return (
    <>
      <Titulo>Mis pedidos</Titulo>

      {nuevoPedido && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ¡Listo! Tu pedido #{nuevoPedido} fue creado y está pendiente.
        </div>
      )}
      {cancelar.error && (
        <div className="mb-4">
          <EstadoError mensaje={handleApiError(cancelar.error)} />
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : error ? (
        <EstadoError mensaje={handleApiError(error)} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <Card className="divide-y divide-slate-100">
            {data.items.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-40 flex-1">
                  <p className="font-semibold text-slate-800">Pedido #{p.id}</p>
                  <p className="text-sm text-slate-500">
                    {formatFecha(p.created_at)} · {p.items.length} producto(s)
                  </p>
                </div>
                <BadgeEstado estado={p.estado} />
                <p className="w-28 text-right font-semibold">{formatPrecio(p.total)}</p>
                <div className="flex gap-2">
                  <Button variante="secundario" onClick={() => setSeleccionado(p.id)}>
                    Ver detalle
                  </Button>
                  {/* El dueño solo puede cancelar en PENDIENTE (RN-04) */}
                  {p.estado === "PENDIENTE" && (
                    <Button
                      variante="peligro"
                      cargando={cancelar.isPending && cancelar.variables === p.id}
                      onClick={() => confirmarCancelacion(p.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </Card>
          <Paginacion pagina={pagina} limite={LIMITE} total={data.total} onCambiar={setPagina} />
        </>
      )}

      <Modal
        abierto={seleccionado !== null}
        titulo={`Pedido #${seleccionado ?? ""}`}
        onCerrar={() => setSeleccionado(null)}
        ancho="lg"
      >
        {detalle.isLoading ? (
          <SkeletonFilas filas={3} />
        ) : detalle.error ? (
          <EstadoError mensaje={handleApiError(detalle.error)} />
        ) : (
          detalle.data && <PedidoDetalle pedido={detalle.data} />
        )}
      </Modal>
    </>
  );
}
