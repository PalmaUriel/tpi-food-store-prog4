import type { FormEvent, ReactNode } from "react";
import EstadoError from "../components/EstadoError";
import Button from "./Button";
import Modal from "./Modal";

interface FormModalProps {
  abierto: boolean;
  titulo: string;
  error: string | null;
  guardando: boolean;
  onCerrar: () => void;
  onSubmit: () => void;
  children: ReactNode; // los campos del formulario
}

// Modal con un <form>, el mensaje de error y los botones Cancelar / Guardar
export default function FormModal({
  abierto,
  titulo,
  error,
  guardando,
  onCerrar,
  onSubmit,
  children,
}: FormModalProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">{children}</div>
        {error && (
          <div className="mt-4">
            <EstadoError mensaje={error} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
