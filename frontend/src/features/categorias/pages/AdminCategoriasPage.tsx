import { useForm } from "@tanstack/react-form";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import Titulo from "../../../shared/components/Titulo";
import Button from "../../../shared/ui/Button";
import FormModal from "../../../shared/ui/FormModal";
import Input, { TextArea } from "../../../shared/ui/Input";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

interface ValoresForm {
  nombre: string;
  descripcion: string;
}

const VACIO: ValoresForm = { nombre: "", descripcion: "" };
const SIN_DATOS: Categoria[] = [];

const columnHelper = createColumnHelper<Categoria>();
const columnas = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("nombre", { header: "Nombre" }),
  columnHelper.accessor((c) => c.descripcion ?? "—", { id: "descripcion", header: "Descripción" }),
];

export default function AdminCategoriasPage() {
  const { data = SIN_DATOS, isLoading, error } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const form = useForm({
    defaultValues: VACIO,
    onSubmit: async ({ value }) => {
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null };
      try {
        if (editando) await actualizar.mutateAsync({ id: editando.id, datos });
        else await crear.mutateAsync(datos);
        setAbierto(false);
      } catch {
        // el error se muestra en el modal (por ejemplo, 409 nombre repetido)
      }
    },
  });

  const table = useReactTable({
    data,
    columns: columnas,
    getRowId: (c) => String(c.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const abrir = (categoria: Categoria | null) => {
    crear.reset();
    actualizar.reset();
    setEditando(categoria);
    // keepDefaultValues: carga estos valores sin reemplazar los defaultValues del useForm
    // (si no, en el próximo render useForm vuelve a poner VACIO y el formulario queda en blanco)
    form.reset(
      categoria ? { nombre: categoria.nombre, descripcion: categoria.descripcion ?? "" } : VACIO,
      { keepDefaultValues: true },
    );
    setAbierto(true);
  };

  const darDeBaja = (categoria: Categoria) => {
    if (confirm(`¿Dar de baja "${categoria.nombre}"? Sus productos siguen visibles hasta que los des de baja.`)) {
      eliminar.mutate(categoria.id);
    }
  };

  const errorGuardado = crear.error ?? actualizar.error;

  return (
    <>
      <Titulo acciones={<Button onClick={() => abrir(null)}>+ Nueva categoría</Button>}>Categorías</Titulo>

      {eliminar.error && (
        <div className="mb-4">
          <EstadoError mensaje={handleApiError(eliminar.error)} />
        </div>
      )}

      <DataTable
        table={table}
        cargando={isLoading}
        error={error ? handleApiError(error) : null}
        mensajeVacio="No hay categorías cargadas."
        renderAcciones={(categoria) => (
          <div className="flex justify-end gap-1">
            <Button variante="texto" onClick={() => abrir(categoria)}>
              Editar
            </Button>
            <Button variante="texto" className="text-red-600 hover:bg-red-50" onClick={() => darDeBaja(categoria)}>
              Eliminar
            </Button>
          </div>
        )}
      />

      <FormModal
        abierto={abierto}
        titulo={editando ? "Editar categoría" : "Nueva categoría"}
        error={errorGuardado ? handleApiError(errorGuardado) : null}
        guardando={crear.isPending || actualizar.isPending}
        onCerrar={() => setAbierto(false)}
        onSubmit={() => void form.handleSubmit()}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length;
              return largo < 2 ? "Mínimo 2 caracteres" : largo > 100 ? "Máximo 100 caracteres" : undefined;
            },
          }}
        >
          {(field) => <Input field={field} label="Nombre" />}
        </form.Field>
        <form.Field
          name="descripcion"
          validators={{ onChange: ({ value }) => (value.length > 255 ? "Máximo 255 caracteres" : undefined) }}
        >
          {(field) => <TextArea field={field} label="Descripción" />}
        </form.Field>
      </FormModal>
    </>
  );
}
