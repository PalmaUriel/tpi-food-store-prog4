import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import Titulo from "../../../shared/components/Titulo";
import Button from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import type { UserPublic } from "../../auth/types/auth";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";

const SIN_DATOS: UserPublic[] = [];

const columnHelper = createColumnHelper<UserPublic>();
const columnas = [
  columnHelper.accessor("username", { header: "Usuario" }),
  columnHelper.accessor("full_name", { header: "Nombre" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("role", { header: "Rol" }),
  columnHelper.accessor("disabled", {
    header: "Estado",
    cell: (c) =>
      c.getValue() ? (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Desactivado</span>
      ) : (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activo</span>
      ),
  }),
];

export default function AdminUsuariosPage() {
  const miId = useAuthStore((state) => state.usuario?.id);
  const { data = SIN_DATOS, isLoading, error } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const table = useReactTable({
    data,
    columns: columnas,
    getRowId: (u) => String(u.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const procesando = activar.isPending || desactivar.isPending;
  const errorAccion = activar.error ?? desactivar.error;

  return (
    <>
      <Titulo>Usuarios</Titulo>

      {errorAccion && (
        <div className="mb-4">
          <EstadoError mensaje={handleApiError(errorAccion)} />
        </div>
      )}

      <DataTable
        table={table}
        cargando={isLoading}
        error={error ? handleApiError(error) : null}
        mensajeVacio="No hay usuarios registrados."
        renderAcciones={(usuario) =>
          usuario.disabled ? (
            <Button variante="texto" disabled={procesando} onClick={() => activar.mutate(usuario.id)}>
              Activar
            </Button>
          ) : usuario.id === miId ? (
            // El botón Desactivar no se muestra en la fila del usuario de la sesión
            <span className="text-xs italic text-slate-400">Tu cuenta</span>
          ) : (
            <Button
              variante="texto"
              className="text-red-600 hover:bg-red-50"
              disabled={procesando}
              onClick={() =>
                confirm(`¿Desactivar a ${usuario.username}? No podrá iniciar sesión.`) &&
                desactivar.mutate(usuario.id)
              }
            >
              Desactivar
            </Button>
          )
        }
      />
    </>
  );
}
