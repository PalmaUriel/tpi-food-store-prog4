import type { AnyFieldApi } from "@tanstack/react-form";

// Campos conectados a TanStack Form: muestran el error del campo después de tocarlo

const claseBase =
  "w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200";

function errorDe(field: AnyFieldApi): string | null {
  const { isTouched, errors } = field.state.meta;
  return isTouched && errors.length > 0 ? String(errors[0]) : null;
}

function claseCampo(error: string | null): string {
  return `${claseBase} ${error ? "border-red-400" : "border-slate-300 focus:border-orange-500"}`;
}

function Etiqueta({ htmlFor, texto }: { htmlFor: string; texto: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {texto}
    </label>
  );
}

function MensajeError({ mensaje }: { mensaje: string | null }) {
  return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

interface CampoProps {
  field: AnyFieldApi;
  label: string;
}

interface InputProps extends CampoProps {
  tipo?: "text" | "email" | "password" | "url";
  autoComplete?: string;
  placeholder?: string;
}

export default function Input({ field, label, tipo = "text", autoComplete, placeholder }: InputProps) {
  const error = errorDe(field);
  return (
    <div>
      <Etiqueta htmlFor={field.name} texto={label} />
      <input
        id={field.name}
        name={field.name}
        type={tipo}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={claseCampo(error)}
      />
      <MensajeError mensaje={error} />
    </div>
  );
}

export function TextArea({ field, label }: CampoProps) {
  const error = errorDe(field);
  return (
    <div>
      <Etiqueta htmlFor={field.name} texto={label} />
      <textarea
        id={field.name}
        name={field.name}
        rows={3}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={claseCampo(error)}
      />
      <MensajeError mensaje={error} />
    </div>
  );
}

export function InputNumero({ field, label, paso = 1 }: CampoProps & { paso?: number }) {
  const error = errorDe(field);
  const valor = field.state.value as number;
  return (
    <div>
      <Etiqueta htmlFor={field.name} texto={label} />
      <input
        id={field.name}
        name={field.name}
        type="number"
        step={paso}
        value={Number.isNaN(valor) ? "" : valor}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        className={claseCampo(error)}
      />
      <MensajeError mensaje={error} />
    </div>
  );
}

interface Opcion {
  valor: string;
  texto: string;
}

export function Select({ field, label, opciones }: CampoProps & { opciones: Opcion[] }) {
  const error = errorDe(field);
  return (
    <div>
      <Etiqueta htmlFor={field.name} texto={label} />
      <select
        id={field.name}
        name={field.name}
        value={String(field.state.value)}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={claseCampo(error)}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      <MensajeError mensaje={error} />
    </div>
  );
}

export function Checkbox({ field, label }: CampoProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={field.name}
        checked={field.state.value as boolean}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="h-4 w-4 accent-orange-600"
      />
      {label}
    </label>
  );
}
