import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  children?: ReactNode; // por ejemplo, un botón para salir del estado vacío
}

export default function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      <p>{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
