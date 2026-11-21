import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, useEsAdmin } from "../store/authStore";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-slate-700" : "hover:bg-slate-700"}`;

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const esAdmin = useEsAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!user) return null; // sin sesión no hay barra

  const cerrarSesion = async () => {
    await logout();
    queryClient.clear(); // descarta los datos cacheados del usuario anterior
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-slate-900 text-white shadow">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-6">
          <NavLink to="/categories" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold">
              FS
            </span>
            <span className="text-lg font-semibold">Food Store</span>
          </NavLink>
          <div className="flex gap-1">
            <NavLink to="/categories" className={claseLink}>
              Categorías
            </NavLink>
            <NavLink to="/products" className={claseLink}>
              Productos
            </NavLink>
            {esAdmin && (
              <NavLink to="/admin/users" className={claseLink}>
                Usuarios
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-slate-400">{user.roles.join(", ")}</p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}