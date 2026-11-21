import { useState, type FormEvent } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import { SkeletonTarjetas } from "../../../shared/components/Skeleton";
import Titulo from "../../../shared/components/Titulo";
import Button from "../../../shared/ui/Button";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMITE = 8;

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [textoBusqueda, setTextoBusqueda] = useState(""); // lo que se escribe
  const [busqueda, setBusqueda] = useState(""); // lo que se buscó (al enviar)
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isFetching, error } = useProductos({
    skip: pagina * LIMITE, // paginación en el servidor
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  });

  const buscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusqueda(textoBusqueda.trim());
    setPagina(0); // un filtro nuevo vuelve a la primera página
  };

  const limpiar = () => {
    setTextoBusqueda("");
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(0);
  };

  return (
    <>
      <Titulo>Catálogo</Titulo>

      <form onSubmit={buscar} className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre…"
          aria-label="Buscar por nombre"
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          className="min-w-56 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId ?? ""}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
            setPagina(0);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
        {(busqueda || categoriaId) && (
          <Button variante="secundario" onClick={limpiar}>
            Limpiar
          </Button>
        )}
      </form>

      {isLoading ? (
        <SkeletonTarjetas cantidad={LIMITE} />
      ) : error ? (
        <EstadoError mensaje={`No se pudo cargar el catálogo: ${handleApiError(error)}`} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros.">
          {(busqueda || categoriaId) && (
            <Button variante="secundario" onClick={limpiar}>
              Ver todo el catálogo
            </Button>
          )}
        </EstadoVacio>
      ) : (
        <div className={isFetching ? "opacity-60 transition" : "transition"}>
          <p className="mb-3 text-sm text-slate-500">{data.total} productos</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} limite={LIMITE} total={data.total} onCambiar={setPagina} />
        </div>
      )}
    </>
  );
}
