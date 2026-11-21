interface PaginacionProps {
  pagina: number; // empieza en 0
  limite: number;
  total: number;
  onCambiar: (pagina: number) => void;
}

// Paginación del lado del servidor: el backend recibe skip = pagina × limite
export default function Paginacion({ pagina, limite, total, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  if (total <= limite) return null;

  const boton =
    "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-600" aria-label="Paginación">
      <button type="button" className={boton} disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </button>
      <span>
        Página {pagina + 1} de {paginas}
      </span>
      <button
        type="button"
        className={boton}
        disabled={pagina + 1 >= paginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
