// Bloques grises animados que ocupan el lugar del contenido mientras carga

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

export function SkeletonTarjetas({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Skeleton className="h-40 rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
