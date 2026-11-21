import { Link, useNavigate } from "react-router-dom";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Titulo from "../../../shared/components/Titulo";
import { formatPrecio } from "../../../shared/utils/formato";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { useCartStore } from "../../../store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <>
        <Titulo>Carrito</Titulo>
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      </>
    );
  }

  const botonCantidad =
    "h-8 w-8 rounded-md border border-slate-300 text-lg leading-none hover:bg-slate-100";

  return (
    <>
      <Titulo
        acciones={
          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
        }
      >
        Carrito
      </Titulo>

      <Card className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-48 flex-1">
              <p className="font-medium text-slate-800">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
              <button
                type="button"
                className={botonCantidad}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.cantidad}</span>
              <button
                type="button"
                className={botonCantidad}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                aria-label="Agregar uno"
              >
                +
              </button>
            </div>

            <p className="w-28 text-right font-semibold text-slate-800">
              {formatPrecio(item.precio_unitario * item.cantidad)}
            </p>
            <Button variante="texto" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            El stock y el precio final se confirman al crear el pedido.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-lg">
              Total: <span className="font-bold">{formatPrecio(total)}</span>
            </p>
            <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
