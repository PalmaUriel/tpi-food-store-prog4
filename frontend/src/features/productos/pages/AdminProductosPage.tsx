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
import { formatPrecio } from "../../../shared/utils/formato";
import Button from "../../../shared/ui/Button";
import FormModal from "../../../shared/ui/FormModal";
import Input, { Checkbox, InputNumero, Select, TextArea } from "../../../shared/ui/Input";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoStockUpdate } from "../types/producto";

interface ValoresProducto {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: string; // el <select> trabaja con texto
}

const VACIO: ValoresProducto = {
  nombre: "",
  descripcion: "",
  precio_base: 0,
  imagen_url: "",
  stock: 0,
  disponible: true,
  categoria_id: "",
};
const SIN_DATOS: Producto[] = [];

const columnHelper = createColumnHelper<Producto>();
const columnas = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("nombre", { header: "Nombre" }),
  columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
  columnHelper.accessor("precio_base", { header: "Precio", cell: (c) => formatPrecio(c.getValue()) }),
  columnHelper.accessor("stock", { header: "Stock" }),
  columnHelper.accessor("disponible", {
    header: "Disponible",
    cell: (c) => (c.getValue() ? "Sí" : <span className="text-red-600">No</span>),
  }),
];

const enteroNoNegativo = ({ value }: { value: number }) =>
  Number.isNaN(value) || value < 0 || !Number.isInteger(value) ? "Ingresá un entero mayor o igual a 0" : undefined;

export default function AdminProductosPage() {
  // El panel pide limit=100 y TanStack Table pagina en el navegador
  const { data, isLoading, error } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [enStock, setEnStock] = useState<Producto | null>(null);

  const form = useForm({
    defaultValues: VACIO,
    onSubmit: async ({ value }) => {
      const datos = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      };
      try {
        if (editando) await actualizar.mutateAsync({ id: editando.id, datos });
        else await crear.mutateAsync(datos);
        setAbierto(false);
      } catch {
        // el error se muestra en el modal
      }
    },
  });

  const formStock = useForm({
    defaultValues: { stock: 0, disponible: true } as ProductoStockUpdate,
    onSubmit: async ({ value }) => {
      if (!enStock) return;
      try {
        await actualizarStock.mutateAsync({ id: enStock.id, datos: value });
        setEnStock(null);
      } catch {
        // el error se muestra en el modal
      }
    },
  });

  const table = useReactTable({
    data: data?.items ?? SIN_DATOS,
    columns: columnas,
    getRowId: (p) => String(p.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const abrir = (producto: Producto | null) => {
    crear.reset();
    actualizar.reset();
    setEditando(producto);
    form.reset(
      producto
        ? {
            nombre: producto.nombre,
            descripcion: producto.descripcion ?? "",
            precio_base: producto.precio_base,
            imagen_url: producto.imagen_url ?? "",
            stock: producto.stock,
            disponible: producto.disponible,
            categoria_id: String(producto.categoria_id),
          }
        : { ...VACIO, categoria_id: categorias[0] ? String(categorias[0].id) : "" },
      { keepDefaultValues: true }, // ver el comentario en AdminCategoriasPage
    );
    setAbierto(true);
  };

  const abrirStock = (producto: Producto) => {
    actualizarStock.reset();
    formStock.reset({ stock: producto.stock, disponible: producto.disponible }, { keepDefaultValues: true });
    setEnStock(producto);
  };

  const darDeBaja = (producto: Producto) => {
    if (confirm(`¿Dar de baja "${producto.nombre}"? Deja de mostrarse en el catálogo.`)) {
      eliminar.mutate(producto.id);
    }
  };

  const opcionesCategoria = categorias.map((c) => ({ valor: String(c.id), texto: c.nombre }));
  const errorGuardado = crear.error ?? actualizar.error;

  return (
    <>
      <Titulo acciones={<Button onClick={() => abrir(null)}>+ Nuevo producto</Button>}>Productos</Titulo>

      {eliminar.error && (
        <div className="mb-4">
          <EstadoError mensaje={handleApiError(eliminar.error)} />
        </div>
      )}

      <DataTable
        table={table}
        cargando={isLoading}
        error={error ? handleApiError(error) : null}
        mensajeVacio="No hay productos cargados."
        renderAcciones={(producto) => (
          <div className="flex justify-end gap-1">
            <Button variante="texto" onClick={() => abrir(producto)}>
              Editar
            </Button>
            <Button variante="texto" onClick={() => abrirStock(producto)}>
              Stock
            </Button>
            <Button variante="texto" className="text-red-600 hover:bg-red-50" onClick={() => darDeBaja(producto)}>
              Eliminar
            </Button>
          </div>
        )}
      />

      {/* Alta y edición */}
      <FormModal
        abierto={abierto}
        titulo={editando ? "Editar producto" : "Nuevo producto"}
        error={errorGuardado ? handleApiError(errorGuardado) : null}
        guardando={crear.isPending || actualizar.isPending}
        onCerrar={() => setAbierto(false)}
        onSubmit={() => void form.handleSubmit()}
      >
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : "El nombre es obligatorio") }}
        >
          {(field) => <Input field={field} label="Nombre" />}
        </form.Field>
        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : "Elegí una categoría") }}
        >
          {(field) => <Select field={field} label="Categoría" opciones={opcionesCategoria} />}
        </form.Field>
        <form.Field name="descripcion">{(field) => <TextArea field={field} label="Descripción" />}</form.Field>
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => (Number.isNaN(value) || value < 0 ? "Debe ser mayor o igual a 0" : undefined),
            }}
          >
            {(field) => <InputNumero field={field} label="Precio" paso={0.01} />}
          </form.Field>
          <form.Field name="stock" validators={{ onChange: enteroNoNegativo }}>
            {(field) => <InputNumero field={field} label="Stock" />}
          </form.Field>
        </div>
        <form.Field name="imagen_url">
          {(field) => <Input field={field} label="URL de la imagen" tipo="url" placeholder="https://…" />}
        </form.Field>
        <form.Field name="disponible">{(field) => <Checkbox field={field} label="Disponible para la venta" />}</form.Field>
      </FormModal>

      {/* Cambio rápido de stock y disponibilidad: PATCH /productos/{id}/stock */}
      <FormModal
        abierto={enStock !== null}
        titulo={`Stock de ${enStock?.nombre ?? ""}`}
        error={actualizarStock.error ? handleApiError(actualizarStock.error) : null}
        guardando={actualizarStock.isPending}
        onCerrar={() => setEnStock(null)}
        onSubmit={() => void formStock.handleSubmit()}
      >
        <formStock.Field name="stock" validators={{ onChange: enteroNoNegativo }}>
          {(field) => <InputNumero field={field} label="Stock" />}
        </formStock.Field>
        <formStock.Field name="disponible">
          {(field) => <Checkbox field={field} label="Disponible para la venta" />}
        </formStock.Field>
      </FormModal>
    </>
  );
}
