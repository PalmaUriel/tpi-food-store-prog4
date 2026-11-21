interface EstadoErrorProps {
  mensaje: string;
}

export default function EstadoError({ mensaje }: EstadoErrorProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {mensaje}
    </div>
  );
}