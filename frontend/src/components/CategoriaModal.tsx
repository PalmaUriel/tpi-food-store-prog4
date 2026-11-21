import type { ReactNode } from "react";
import FormModal from "./FormModal";

interface CategoriaModalProps {
  isOpen: boolean;
  esEdicion: boolean;
  error: string | null;
  guardando: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function CategoriaModal({ esEdicion, ...props }: CategoriaModalProps) {
  return <FormModal titulo={esEdicion ? "Editar categoría" : "Nueva categoría"} {...props} />;
}