import type { ReactNode } from "react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: "md" | "lg";
}

export default function Modal({ abierto, titulo, onCerrar, children, ancho = "md" }: ModalProps) {
  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onCerrar()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${ancho === "lg" ? "max-w-2xl" : "max-w-md"}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md px-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
