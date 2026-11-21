import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import EstadoCarga from "./EstadoCarga";

interface ProtectedRouteProps {
  allowedRoles?: string[]; // sin roles = alcanza con tener sesión
}

// Envuelve un grupo de rutas: <Route element={<ProtectedRoute />}> ... </Route>
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  // 1) Mientras /auth/me confirma la sesión, no se decide nada
  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <EstadoCarga mensaje="Verificando sesión…" />
      </main>
    );
  }

  // 2) Sin sesión -> al login
  if (!user) return <Navigate to="/login" replace />;

  // 3) Con sesión pero sin ninguno de los roles permitidos -> acceso denegado
  if (allowedRoles && !allowedRoles.some((rol) => user.roles.includes(rol))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4) Todo bien: se muestra la ruta hija
  return <Outlet />;
}