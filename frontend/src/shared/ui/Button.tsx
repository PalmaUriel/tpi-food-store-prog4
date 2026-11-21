import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro" | "texto";

const estilos: Record<Variante, string> = {
  primario: "bg-orange-600 text-white hover:bg-orange-700",
  secundario: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  peligro: "bg-red-600 text-white hover:bg-red-700",
  texto: "text-orange-700 hover:bg-orange-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

export default function Button({
  variante = "primario",
  cargando = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    >
      {cargando && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
