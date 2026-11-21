import { useForm } from "@tanstack/react-form";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import { register } from "../api/auth";
import type { UserCreate } from "../types/auth";

const VALORES_INICIALES: UserCreate = { username: "", full_name: "", email: "", password: "" };
const EMAIL = /^\S+@\S+\.\S+$/;

export default function RegisterPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { replace: true, state: { registrado: true } });
      } catch (e) {
        setError(handleApiError(e)); // 409 usuario o email repetido
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <Card className="mx-auto max-w-md p-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Crear cuenta</h1>
      <p className="mb-6 text-sm text-slate-500">Registrate para hacer pedidos.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 3 ? "Mínimo 3 caracteres" : value.length > 50 ? "Máximo 50" : undefined,
          }}
        >
          {(field) => <Input field={field} label="Usuario" autoComplete="username" />}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Ingresá tu nombre") }}
        >
          {(field) => <Input field={field} label="Nombre completo" autoComplete="name" />}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (EMAIL.test(value.trim()) ? undefined : "Ingresá un email válido"),
          }}
        >
          {(field) => <Input field={field} label="Email" tipo="email" autoComplete="email" />}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length < 8 ? "Mínimo 8 caracteres" : value.length > 72 ? "Máximo 72" : undefined,
          }}
        >
          {(field) => (
            <Input field={field} label="Contraseña" tipo="password" autoComplete="new-password" />
          )}
        </form.Field>

        {error && <EstadoError mensaje={error} />}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
              Registrarme
            </Button>
          )}
        </form.Subscribe>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-orange-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
