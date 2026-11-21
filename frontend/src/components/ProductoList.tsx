import type { Table } from "@tanstack/react-table";
import type { Producto } from "../types/producto";
import BotonesFila from "./BotonesFila";
import DataTable from "./DataTable";

interface ProductoListProps {
  table: Table<Producto>;
  isLoading: boolean;
  error: Error | null;
  puedeEditar: boolean; // false = sin columna de acciones (usuario sin rol admin)
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

export default function ProductoList({
  table,
  isLoading,
  error,
  puedeEditar,
  onEdit,
  onDelete,
}: ProductoListProps) {
  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      error={error}
      mensajeVacio={
        puedeEditar
          ? 'No hay productos cargados. Creá el primero con "Nuevo producto".'
          : "Todavía no hay productos cargados."
      }
      renderAcciones={
        puedeEditar
          ? (producto) => (
              <BotonesFila onEditar={() => onEdit(producto)} onEliminar={() => onDelete(producto)} />
            )
          : undefined
      }
    />
  );
}