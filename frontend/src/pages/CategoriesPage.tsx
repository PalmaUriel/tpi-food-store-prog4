import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { CampoTexto } from "../components/Campos";
import CategoriaList from "../components/CategoriaList";
import CategoriaModal from "../components/CategoriaModal";
import EstadoError from "../components/EstadoError";
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from "../services/categoria";
import type { Categoria, CategoriaInput } from "../types/categoria";
import { useEsAdmin } from "../store/authStore";

// ---------- Definiciones fuera del componente (referencias estables) ----------

const SIN_DATOS: Categoria[] = [];
const VALORES_VACIOS: CategoriaInput = { nombre: "", descripcion: "" };

const columnHelper = createColumnHelper<Categoria>();
const columnas = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("nombre", { header: "Nombre" }),
  columnHelper.accessor("descripcion", {
    header: "Descripción",
    cell: (info) => info.getValue() || <span className="italic text-slate-400">Sin descripción</span>,
  }),
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
    // Los botones de escritura solo se muestran al admin (el backend igual responde 403)
  const esAdmin = useEsAdmin();

  // ---------- Estado de la interfaz ----------
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);

  // ---------- Estado del servidor: lectura ----------
  const { data = SIN_DATOS, isLoading, error } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  // ---------- Estado del servidor: escritura ----------
  const cerrarModal = () => {
    setIsModalOpen(false);
    setSeleccionada(null);
  };

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["categorias"] });

  const crearMutation = useMutation({
    mutationFn: createCategoria,
    onSuccess: async () => {
      await invalidar();
      cerrarModal();
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) => updateCategoria(id, datos),
    onSuccess: async () => {
      await invalidar();
      cerrarModal();
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: invalidar,
  });

  // ---------- TanStack Form ----------
  const form = useForm({
    defaultValues: VALORES_VACIOS,
    onSubmit: ({ value }) => {
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() };
      if (seleccionada) {
        editarMutation.mutate({ id: seleccionada.id, datos });
      } else {
        crearMutation.mutate(datos);
      }
    },
  });

  // ---------- TanStack Table ----------
  const table = useReactTable({
    data,
    columns: columnas,
    getRowId: (categoria) => String(categoria.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  // ---------- Acciones ----------
  const limpiarErrores = () => {
    crearMutation.reset();
    editarMutation.reset();
    eliminarMutation.reset();
  };

  const abrirAlta = () => {
    limpiarErrores();
    setSeleccionada(null);
    form.reset(VALORES_VACIOS, { keepDefaultValues: true });
    setIsModalOpen(true);
  };

  const abrirEdicion = (categoria: Categoria) => {
    limpiarErrores();
    setSeleccionada(categoria);
    form.reset(
      { nombre: categoria.nombre, descripcion: categoria.descripcion },
      { keepDefaultValues: true },
    );
    setIsModalOpen(true);
  };

  const eliminar = (categoria: Categoria) => {
    if (confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      limpiarErrores();
      eliminarMutation.mutate(categoria.id);
    }
  };

  const errorGuardado = crearMutation.error ?? editarMutation.error;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Categorías</h2>
        {esAdmin && (
          <button
            type="button"
            onClick={abrirAlta}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            + Nueva categoría
          </button>
        )}
      </div>

      {eliminarMutation.error && (
        <div className="mb-4">
          <EstadoError mensaje={eliminarMutation.error.message} />
        </div>
      )}

      <CategoriaList
        table={table}
        isLoading={isLoading}
        error={error}
        puedeEditar={esAdmin}
        onEdit={abrirEdicion}
        onDelete={eliminar}
      />

      <CategoriaModal
        isOpen={isModalOpen}
        esEdicion={seleccionada !== null}
        error={errorGuardado?.message ?? null}
        guardando={crearMutation.isPending || editarMutation.isPending}
        onClose={cerrarModal}
        onSubmit={form.handleSubmit}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => (value.trim() ? undefined : "El nombre es obligatorio"),
          }}
        >
          {(field) => <CampoTexto field={field} label="Nombre" />}
        </form.Field>

        <form.Field
          name="descripcion"
          validators={{
            onChange: ({ value }) =>
              value.length > 255 ? "Máximo 255 caracteres" : undefined,
          }}
        >
          {(field) => <CampoTexto field={field} label="Descripción" multilinea />}
        </form.Field>
      </CategoriaModal>
    </main>
  );
}