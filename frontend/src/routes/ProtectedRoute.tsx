import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "../features/auth/types/auth";
import { Skeleton } from "../shared/components/Skeleton";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  roles?: Rol[]; // sin roles = alcanza con tener sesión
}

// Envuelve un grupo de rutas: <Route element={<ProtectedRoute roles={["admin"]} />}>...</Route>
export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const location = useLocation();

  // 1) Mientras checkSession confirma la sesión, se muestra un indicador
  if (cargando) {
    return (
      <div className="space-y-3" aria-label="Verificando sesión">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // 2) Sin sesión -> al login, recordando a dónde quería ir
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;

  // 3) Con sesión pero sin el rol -> acceso denegado
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
