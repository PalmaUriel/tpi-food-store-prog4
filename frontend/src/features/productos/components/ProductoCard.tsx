import { useState } from "react";
import { formatPrecio } from "../../../shared/utils/formato";
import Button from "../../../shared/ui/Button";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types/producto";

interface ProductoCardProps {
  producto: Producto;
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const [imagenRota, setImagenRota] = useState(false);

  const sinStock = producto.stock === 0;
  const tope = enCarrito >= producto.stock; // no deja agregar más de lo que hay
  const vendible = producto.disponible && !sinStock && !tope;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-40 items-center justify-center bg-orange-50">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            🍽️
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-orange-700">
          {producto.categoria.nombre}
        </span>
        <h2 className="font-semibold text-slate-800">{producto.nombre}</h2>
        {producto.descripcion && <p className="text-sm text-slate-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">{formatPrecio(producto.precio_base)}</span>
          <span className="text-xs text-slate-500">
            {!producto.disponible ? "No disponible" : sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          disabled={!vendible}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en el carrito)` : "Agregar al carrito"}
        </Button>
      </div>
    </article>
  );
}
