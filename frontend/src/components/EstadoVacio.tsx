interface EstadoVacioProps {
  mensaje: string;
}

export default function EstadoVacio({ mensaje }: EstadoVacioProps) {
  return (
    <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      {mensaje}
    </p>
  );
}