import { flexRender, type Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import EstadoCarga from "./EstadoCarga";
import EstadoError from "./EstadoError";
import EstadoVacio from "./EstadoVacio";

interface DataTableProps<T> {
  table: Table<T>;
  isLoading: boolean;
  error: Error | null;
  mensajeVacio: string;
  renderAcciones?: (fila: T) => ReactNode;
}

export default function DataTable<T>({
  table,
  isLoading,
  error,
  mensajeVacio,
  renderAcciones,
}: DataTableProps<T>) {
  if (isLoading) return <EstadoCarga />;
  if (error) return <EstadoError mensaje={`No se pudieron cargar los datos: ${error.message}`} />;
  if (table.getCoreRowModel().rows.length === 0) return <EstadoVacio mensaje={mensajeVacio} />;

  const { pageIndex } = table.getState().pagination;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 uppercase hover:text-slate-800"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-slate-400">
                            {orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
                {renderAcciones && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {renderAcciones && (
                  <td className="px-4 py-3 text-right">{renderAcciones(row.original)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
        <span>
          Página {pageIndex + 1} de {table.getPageCount()} · {table.getRowCount()} registros
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}