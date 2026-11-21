import { useForm } from "@tanstack/react-form";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { CampoTexto } from "../components/Campos";
import EstadoError from "../components/EstadoError";
import { useAuthStore } from "../store/authStore";
import type { LoginCredentials } from "../types/auth.types";

const VALORES_INICIALES: LoginCredentials = { email: "", password: "" };

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Mensaje que deja RegisterPage al redirigir acá
  const recienRegistrado = (location.state as { registrado?: boolean } | null)?.registrado;

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.email.trim(), value.password);
        navigate("/categories", { replace: true });
      } catch (e) {
        // Credenciales inválidas: se muestra el mensaje sin recargar la página (HU-02)
        setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
      }
    },
  });

  // Si ya hay sesión, no tiene sentido mostrar el login
  if (user) return <Navigate to="/categories" replace />;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // evita que el navegador recargue la página
    void form.handleSubmit();
  };

  return (
    <AuthLayout titulo="Iniciar sesión" subtitulo="Food Store">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {recienRegistrado && !error && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Cuenta creada. Ya podés iniciar sesión.
          </div>
        )}

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value.trim()
                ? "El email es obligatorio"
                : !/^\S+@\S+\.\S+$/.test(value.trim())
                  ? "Ingresá un email válido"
                  : undefined,
          }}
        >
          {(field) => <CampoTexto field={field} label="Email" tipo="email" autoComplete="email" />}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value ? undefined : "La contraseña es obligatoria"),
          }}
        >
          {(field) => (
            <CampoTexto
              field={field}
              label="Contraseña"
              tipo="password"
              autoComplete="current-password"
            />
          )}
        </form.Field>

        {error && <EstadoError mensaje={error} />}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm text-slate-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}