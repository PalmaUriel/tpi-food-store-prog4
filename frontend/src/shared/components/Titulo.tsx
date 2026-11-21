import type { ReactNode } from "react";

interface TituloProps {
  children: ReactNode;
  acciones?: ReactNode; // botones a la derecha del título
}

export default function Titulo({ children, acciones }: TituloProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-slate-800">{children}</h1>
      {acciones}
    </div>
  );
}
