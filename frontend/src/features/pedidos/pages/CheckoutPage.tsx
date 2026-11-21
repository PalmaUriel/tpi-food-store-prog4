import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Titulo from "../../../shared/components/Titulo";
import { formatPrecio } from "../../../shared/utils/formato";
import Card from "../../../shared/ui/Card";
import { useCartStore } from "../../../store/cartStore";
import CheckoutForm, { type DatosCheckout } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <>
        <Titulo>Confirmar pedido</Titulo>
        <EstadoVacio mensaje="No hay productos en el carrito.">
          <Link to="/" className="font-medium text-orange-700 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      </>
    );
  }

  const confirmar = async (datos: DatosCheckout) => {
    const pedido = await crearPedido.mutateAsync({
      items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      forma_pago: datos.forma_pago,
      direccion_entrega: datos.direccion_entrega.trim(),
      notas: datos.notas.trim() || null,
    });
    vaciar();
    navigate("/mis-pedidos", { state: { nuevoPedido: pedido.id } });
  };

  return (
    <>
      <Titulo>Confirmar pedido</Titulo>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm
            enviando={crearPedido.isPending}
            error={crearPedido.error ? handleApiError(crearPedido.error) : null}
            onConfirmar={async (datos) => {
              // El error (por ejemplo, stock insuficiente) lo muestra el formulario
              await confirmar(datos).catch(() => undefined);
            }}
          />
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-4 font-semibold text-slate-800">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-semibold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </p>
          <Link to="/carrito" className="mt-3 inline-block text-sm text-orange-700 hover:underline">
            Modificar el carrito
          </Link>
        </Card>
      </div>
    </>
  );
}
