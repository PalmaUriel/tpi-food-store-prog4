import { useForm } from "@tanstack/react-form";
import type { FormEvent } from "react";
import EstadoError from "../../../shared/components/EstadoError";
import Button from "../../../shared/ui/Button";
import Input, { Select, TextArea } from "../../../shared/ui/Input";
import type { FormaPago } from "../types/pedido";

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  enviando: boolean;
  error: string | null;
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
}

const VALORES_INICIALES: DatosCheckout = { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" };

const FORMAS_PAGO = [
  { valor: "EFECTIVO", texto: "Efectivo al recibir" },
  { valor: "TRANSFERENCIA", texto: "Transferencia bancaria" },
];

export default function CheckoutForm({ enviando, error, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => onConfirmar(value),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* RN-06: dirección de 5 a 200 caracteres (el backend vuelve a validarla) */}
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "Máximo 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input field={field} label="Dirección de entrega" autoComplete="street-address" />
        )}
      </form.Field>

      {/* RN-06: solo EFECTIVO o TRANSFERENCIA */}
      <form.Field name="forma_pago">
        {(field) => <Select field={field} label="Forma de pago" opciones={FORMAS_PAGO} />}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
      >
        {(field) => <TextArea field={field} label="Notas (opcional)" />}
      </form.Field>

      {error && <EstadoError mensaje={error} />}

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={enviando}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
