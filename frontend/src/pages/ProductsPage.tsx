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
import CampoCategorias from "../components/CampoCategorias";
import { CampoCheckbox, CampoNumero, CampoTexto } from "../components/Campos";
import EstadoError from "../components/EstadoError";
import ProductoList from "../components/ProductoList";
import ProductoModal from "../components/ProductoModal";
import { getCategorias } from "../services/categoria";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
} from "../services/producto";
import type { Categoria } from "../types/categoria";
import type { Producto, ProductoInput } from "../types/producto";
import { useEsAdmin } from "../store/authStore";

type ProductoFormValues = Omit<ProductoInput, "imagenes_url">;

const SIN_DATOS: Producto[] = [];
const SIN_CATEGORIAS: Categoria[] = [];
const VALORES_VACIOS: ProductoFormValues = {
  nombre: "",
  descripcion: "",
  precio_base: 0,
  disponible: true,
  categoria_ids: [],
};

const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

const columnHelper = createColumnHelper<Producto>();
const columnas = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("nombre", { header: "Nombre" }),
  columnHelper.accessor("descripcion", {
    header: "Descripción",
    cell: (info) => info.getValue() || <span className="italic text-slate-400">Sin descripción</span>,
  }),
  columnHelper.accessor("precio_base", {
    header: "Precio",
    cell: (info) => formatoPrecio.format(info.getValue()),
  }),
   columnHelper.accessor(
    (producto) =>
      producto.categorias
        .map((c) => (c.id === producto.categoria_principal_id ? `★ ${c.nombre}` : c.nombre))
        .join(", "),
    { id: "categorias", header: "Categorías" },
  ),
  columnHelper.accessor("disponible", {
    header: "Disponible",
    cell: (info) =>
      info.getValue() ? (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sí</span>
      ) : (
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">No</span>
      ),
  }),
];

export default function ProductsPage() {
  const queryClient = useQueryClient();

  const esAdmin = useEsAdmin();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  const { data = SIN_DATOS, isLoading, error } = useQuery({
    queryKey: ["productos"],
    queryFn: getProductos,
  });

  // Las categorías se necesitan para elegirlas en el formulario (RN-19)
  const { data: categorias = SIN_CATEGORIAS } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });

  const cerrarModal = () => {
    setIsModalOpen(false);
    setSeleccionado(null);
  };

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["productos"] });

  const crearMutation = useMutation({
    mutationFn: createProducto,
    onSuccess: async () => {
      await invalidar();
      cerrarModal();
    },
  });

  const editarMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoInput }) => updateProducto(id, datos),
    onSuccess: async () => {
      await invalidar();
      cerrarModal();
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: invalidar,
  });

  const form = useForm({
    defaultValues: VALORES_VACIOS,
    onSubmit: ({ value }) => {
      const datos: ProductoInput = {
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        // El formulario no edita las imágenes: se conservan las que ya tenía el producto
        imagenes_url: seleccionado?.imagenes_url ?? [],
      };
      if (seleccionado) {
        editarMutation.mutate({ id: seleccionado.id, datos });
      } else {
        crearMutation.mutate(datos);
      }
    },
  });

  const table = useReactTable({
    data,
    columns: columnas,
    getRowId: (producto) => String(producto.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const limpiarErrores = () => {
    crearMutation.reset();
    editarMutation.reset();
    eliminarMutation.reset();
  };

  const abrirAlta = () => {
    limpiarErrores();
    setSeleccionado(null);
    form.reset(VALORES_VACIOS, { keepDefaultValues: true });
    setIsModalOpen(true);
  };

  const abrirEdicion = (producto: Producto) => {
    limpiarErrores();
    setSeleccionado(producto);
    form.reset(
      {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_base: producto.precio_base,
        disponible: producto.disponible,
        categoria_ids: producto.categorias.map((c) => c.id),
      },
      { keepDefaultValues: true },
    );
    setIsModalOpen(true);
  };

  const eliminar = (producto: Producto) => {
    if (confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      limpiarErrores();
      eliminarMutation.mutate(producto.id);
    }
  };

  const errorGuardado = crearMutation.error ?? editarMutation.error;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-800">Productos</h2>
        {esAdmin && (
          <button
            type="button"
            onClick={abrirAlta}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {eliminarMutation.error && (
        <div className="mb-4">
          <EstadoError mensaje={eliminarMutation.error.message} />
        </div>
      )}

   <ProductoList
        table={table}
        isLoading={isLoading}
        error={error}
        puedeEditar={esAdmin}
        onEdit={abrirEdicion}
        onDelete={eliminar}
      />

      <ProductoModal
        isOpen={isModalOpen}
        esEdicion={seleccionado !== null}
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

        <form.Field name="descripcion">
          {(field) => <CampoTexto field={field} label="Descripción" multilinea />}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value)
                ? "Ingresá un precio"
                : value < 0
                  ? "El precio no puede ser negativo"
                  : undefined,
          }}
        >
          {(field) => <CampoNumero field={field} label="Precio base" />}
        </form.Field>

        <form.Field
          name="categoria_ids"
          validators={{
            onChange: ({ value }) =>
              value.length === 0 ? "Elegí al menos una categoría" : undefined,
          }}
        >
          {(field) => <CampoCategorias field={field} opciones={categorias} />}
        </form.Field>

        <form.Field name="disponible">
          {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
        </form.Field>
      </ProductoModal>
    </main>
  );
}