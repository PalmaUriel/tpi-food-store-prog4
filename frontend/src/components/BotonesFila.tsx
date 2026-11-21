interface BotonesFilaProps {
  onEditar: () => void;
  onEliminar: () => void;
}

export default function BotonesFila({ onEditar, onEliminar }: BotonesFilaProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onEditar}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={onEliminar}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar
      </button>
    </div>
  );
}