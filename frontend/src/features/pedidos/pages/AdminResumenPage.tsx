import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import Titulo from "../../../shared/components/Titulo";
import { formatPrecio } from "../../../shared/utils/formato";
import TarjetaResumen from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const { data, isLoading, error } = useResumenPedidos();

  return (
    <>
      <Titulo>Resumen del negocio</Titulo>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <EstadoError mensaje={handleApiError(error)} />
      ) : (
        data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TarjetaResumen titulo="Pedidos de hoy" valor={String(data.pedidos_hoy)} color="border-l-orange-500" />
            <TarjetaResumen
              titulo="Ingresos (entregados)"
              valor={formatPrecio(data.ingresos_entregados)}
              color="border-l-green-600"
            />
            <TarjetaResumen titulo="Pendientes" valor={String(data.pendientes)} color="border-l-amber-500" />
            <TarjetaResumen titulo="En preparación" valor={String(data.en_preparacion)} color="border-l-blue-500" />
            <TarjetaResumen titulo="Entregados" valor={String(data.entregados)} color="border-l-green-500" />
            <TarjetaResumen titulo="Cancelados" valor={String(data.cancelados)} color="border-l-slate-400" />
          </div>
        )
      )}
    </>
  );
}
