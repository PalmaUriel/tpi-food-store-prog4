interface EstadoCargaProps {
  mensaje?: string;
}

export default function EstadoCarga({ mensaje = "Cargando…" }: EstadoCargaProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      {mensaje}
    </div>
  );
}