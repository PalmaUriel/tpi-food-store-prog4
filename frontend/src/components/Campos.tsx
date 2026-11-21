import type { AnyFieldApi } from "@tanstack/react-form";

const claseInput =
  "w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200";

// Muestra el primer error del campo, solo después de que el usuario lo tocó
function errorDe(field: AnyFieldApi): string | null {
  const { isTouched, errors } = field.state.meta;
  return isTouched && errors.length > 0 ? String(errors[0]) : null;
}

function MensajeError({ mensaje }: { mensaje: string | null }) {
  return mensaje ? <p className="mt-1 text-sm text-red-600">{mensaje}</p> : null;
}

interface CampoProps {
  field: AnyFieldApi;
  label: string;
}


interface CampoTextoProps extends CampoProps {
  multilinea?: boolean;
  tipo?: "text" | "email" | "password" | "tel";
  autoComplete?: string;
}

export function CampoTexto({
  field,
  label,
  multilinea = false,
  tipo = "text",
  autoComplete,
}: CampoTextoProps) {
  const error = errorDe(field);
  const props = {
    id: field.name,
    name: field.name,
    value: field.state.value as string,
    onBlur: field.handleBlur,
    className: `${claseInput} ${error ? "border-red-400" : "border-slate-300 focus:border-blue-500"}`,
  };
  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {multilinea ? (
        <textarea {...props} rows={3} onChange={(e) => field.handleChange(e.target.value)} />
      ) : (
        <input
          {...props}
          type={tipo}
          autoComplete={autoComplete}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      )}
      <MensajeError mensaje={error} />
    </div>
  );
}

export function CampoNumero({ field, label }: CampoProps) {
  const error = errorDe(field);
  const valor = field.state.value as number;
  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type="number"
        step="0.01"
        value={Number.isNaN(valor) ? "" : valor}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        className={`${claseInput} ${error ? "border-red-400" : "border-slate-300 focus:border-blue-500"}`}
      />
      <MensajeError mensaje={error} />
    </div>
  );
}

export function CampoCheckbox({ field, label }: CampoProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={field.name}
        checked={field.state.value as boolean}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="h-4 w-4 accent-blue-600"
      />
      {label}
    </label>
  );
}