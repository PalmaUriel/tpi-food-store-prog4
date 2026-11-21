import type { FormEvent, ReactNode } from "react";

interface FormModalProps {
  isOpen: boolean;
  titulo: string;
  error: string | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function FormModal({
  isOpen,
  titulo,
  error,
  guardando,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-xl font-semibold text-slate-800">{titulo}</h2>

        <div className="space-y-4">{children}</div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}