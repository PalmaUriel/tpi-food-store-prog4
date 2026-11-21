import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];

  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si el producto ya está en el carrito, suma la cantidad en vez de repetirlo
      // (el backend rechaza un pedido con productos repetidos: RN-01)
      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, cantidad }] };
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      // Cantidad menor a 1 = quitar el ítem
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      // Se calcula en el momento: no se guarda, así nunca queda desactualizado
      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: "foodstore-carrito",
      // localStorage: el carrito sobrevive aunque se cierre la pestaña
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

// Cantidad total de unidades, para el contador del Navbar
export const useCantidadEnCarrito = () =>
  useCartStore((state) => state.items.reduce((suma, i) => suma + i.cantidad, 0));
