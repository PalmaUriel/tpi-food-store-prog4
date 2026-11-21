import type { ReactNode } from "react";
import FormModal from "./FormModal";

interface ProductoModalProps {
  isOpen: boolean;
  esEdicion: boolean;
  error: string | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function ProductoModal({ esEdicion, ...props }: ProductoModalProps) {
  return <FormModal titulo={esEdicion ? "Editar producto" : "Nuevo producto"} {...props} />;
}