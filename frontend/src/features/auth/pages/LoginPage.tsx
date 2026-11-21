import { useForm } from "@tanstack/react-form";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import type { LoginCredentials } from "../types/auth";

const VALORES_INICIALES: LoginCredentials = { username: "", password: "" };

interface EstadoNavegacion {
  desde?: string; // ruta protegida a la que se quería entrar (la deja ProtectedRoute)
  registrado?: boolean; // lo deja RegisterPage
}

export default function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const estado = (useLocation().state ?? {}) as EstadoNavegacion;
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username.trim(), value.password);
        navigate(estado.desde ?? "/", { replace: true });
      } catch (e) {
        setError(handleApiError(e)); // 401 credenciales, 400 cuenta desactivada
      }
    },
  });

  if (usuario) return <Navigate to={estado.desde ?? "/"} replace />;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <Card className="mx-auto max-w-md p-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Iniciar sesión</h1>
      <p className="mb-6 text-sm text-slate-500">Ingresá para confirmar pedidos y ver los tuyos.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {estado.registrado && !error && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </div>
        )}
        {estado.desde && !estado.registrado && !error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Iniciá sesión para continuar.
          </div>
        )}

        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Ingresá tu usuario") }}
        >
          {(field) => <Input field={field} label="Usuario" autoComplete="username" />}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : "Ingresá tu contraseña") }}
        >
          {(field) => (
            <Input field={field} label="Contraseña" tipo="password" autoComplete="current-password" />
          )}
        </form.Field>

        {error && <EstadoError mensaje={error} />}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm text-slate-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </Card>
  );
}
