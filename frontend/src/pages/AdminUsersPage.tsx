import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import EstadoError from "../components/EstadoError";
import { activarUsuario, desactivarUsuario, getUsuarios } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import type { UsuarioAdmin } from "../types/auth.types";

const SIN_DATOS: UsuarioAdmin[] = [];

const columnHelper = createColumnHelper<UsuarioAdmin>();
const columnas = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor((u) => `${u.nombre} ${u.apellido}`, { id: "nombre", header: "Nombre" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor((u) => u.roles.join(", ") || "—", { id: "roles", header: "Roles" }),
  columnHelper.accessor("activo", {
    header: "Estado",
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Activo
        </span>
      ) : (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          Desactivado
        </span>
      ),
  }),
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const miId = useAuthStore((state) => state.user?.id);

  const { data = SIN_DATOS, isLoading, error } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: getUsuarios,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });

  const activarMutation = useMutation({ mutationFn: activarUsuario, onSuccess: invalidar });
  const desactivarMutation = useMutation({ mutationFn: desactivarUsuario, onSuccess: invalidar });

  const table = useReactTable({
    data,
    columns: columnas,
    getRowId: (usuario) => String(usuario.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const procesando = activarMutation.isPending || desactivarMutation.isPending;
  const errorAccion = activarMutation.error ?? desactivarMutation.error;

  const cambiarEstado = (usuario: UsuarioAdmin) => {
    activarMutation.reset();
    desactivarMutation.reset();
    if (usuario.activo) {
      if (confirm(`¿Desactivar a ${usuario.nombre} ${usuario.apellido}?`)) {
        desactivarMutation.mutate(usuario.id);
      }
    } else {
      activarMutation.mutate(usuario.id);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold text-slate-800">Usuarios</h2>

      {errorAccion && (
        <div className="mb-4">
          <EstadoError mensaje={errorAccion.message} />
        </div>
      )}

      <DataTable
        table={table}
        isLoading={isLoading}
        error={error}
        mensajeVacio="No hay usuarios registrados."
        renderAcciones={(usuario) =>
          // El admin no puede desactivarse a sí mismo (el backend también lo impide)
          usuario.id === miId ? (
            <span className="text-xs italic text-slate-400">Tu cuenta</span>
          ) : (
            <button
              type="button"
              disabled={procesando}
              onClick={() => cambiarEstado(usuario)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                usuario.activo
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-700 hover:bg-green-50"
              }`}
            >
              {usuario.activo ? "Desactivar" : "Activar"}
            </button>
          )
        }
      />
    </main>
  );
}