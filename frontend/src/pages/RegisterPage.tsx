import { useForm } from "@tanstack/react-form";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { CampoTexto } from "../components/Campos";
import EstadoError from "../components/EstadoError";
import { register } from "../services/auth";
import { useAuthStore } from "../store/authStore";

interface RegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  password: string;
}

const VALORES_INICIALES: RegisterFormValues = {
  nombre: "",
  apellido: "",
  email: "",
  celular: "",
  password: "",
};

const obligatorio = (etiqueta: string) => ({
  onChange: ({ value }: { value: string }) =>
    value.trim() ? undefined : `${etiqueta} es obligatorio`,
});

export default function RegisterPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await register({
          nombre: value.nombre.trim(),
          apellido: value.apellido.trim(),
          email: value.email.trim(),
          celular: value.celular.trim() || null, // opcional
          password: value.password,
        });
        // HU-01: al completar el registro se redirige al login
        navigate("/login", { replace: true, state: { registrado: true } });
      } catch (e) {
        // 409 email repetido, 422 datos inválidos: mensaje del backend
        setError(e instanceof Error ? e.message : "No se pudo completar el registro");
      }
    },
  });

  if (user) return <Navigate to="/categories" replace />;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <AuthLayout titulo="Crear cuenta" subtitulo="Registrate para acceder al Food Store">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="nombre" validators={obligatorio("El nombre")}>
            {(field) => <CampoTexto field={field} label="Nombre" autoComplete="given-name" />}
          </form.Field>
          <form.Field name="apellido" validators={obligatorio("El apellido")}>
            {(field) => <CampoTexto field={field} label="Apellido" autoComplete="family-name" />}
          </form.Field>
        </div>

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

        <form.Field name="celular">
          {(field) => (
            <CampoTexto field={field} label="Celular (opcional)" tipo="tel" autoComplete="tel" />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            // RN-09: mínimo 8 caracteres (el backend también lo valida)
            onChange: ({ value }) =>
              value.length < 8
                ? "Mínimo 8 caracteres"
                : value.length > 72
                  ? "Máximo 72 caracteres"
                  : undefined,
          }}
        >
          {(field) => (
            <CampoTexto field={field} label="Contraseña" tipo="password" autoComplete="new-password" />
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
              {isSubmitting ? "Creando cuenta…" : "Registrarme"}
            </button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}