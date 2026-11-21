import type { Table } from "@tanstack/react-table";
import type { Categoria } from "../types/categoria";
import BotonesFila from "./BotonesFila";
import DataTable from "./DataTable";

interface CategoriaListProps {
  table: Table<Categoria>;
  isLoading: boolean;
  error: Error | null;
  puedeEditar: boolean; // false = sin columna de acciones (usuario sin rol admin)
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

export default function CategoriaList({
  table,
  isLoading,
  error,
  puedeEditar,
  onEdit,
  onDelete,
}: CategoriaListProps) {
  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      error={error}
      mensajeVacio={
        puedeEditar
          ? 'No hay categorías cargadas. Creá la primera con "Nueva categoría".'
          : "Todavía no hay categorías cargadas."
      }
      renderAcciones={
        puedeEditar
          ? (categoria) => (
              <BotonesFila onEditar={() => onEdit(categoria)} onEliminar={() => onDelete(categoria)} />
            )
          : undefined
      }
    />
  );
}