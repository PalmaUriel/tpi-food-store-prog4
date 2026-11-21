import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, useEsAdmin } from "../../store/authStore";
import { useCantidadEnCarrito } from "../../store/cartStore";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-white/15" : "hover:bg-white/10"}`;

const SECCIONES_ADMIN = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

export default function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const esAdmin = useEsAdmin();
  const enCarrito = useCantidadEnCarrito();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    queryClient.clear(); // descarta los datos cacheados del usuario anterior
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-slate-900 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 font-bold">
              FS
            </span>
            <span className="text-lg font-semibold">Food Store</span>
          </NavLink>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={claseLink}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={claseLink}>
              Carrito
              {enCarrito > 0 && (
                <span className="ml-1.5 rounded-full bg-orange-600 px-2 py-0.5 text-xs">{enCarrito}</span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={claseLink}>
                Mis pedidos
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{usuario.full_name}</p>
                <p className="text-xs text-slate-400">{usuario.role}</p>
              </div>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-orange-600 px-3 py-2 text-sm font-medium hover:bg-orange-700"
              >
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* El acceso al panel solo se muestra al admin (la protección real está en el backend) */}
      {esAdmin && (
        <div className="border-t border-white/10 bg-slate-800">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-1.5">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-orange-400">Panel</span>
            {SECCIONES_ADMIN.map((s) => (
              <NavLink key={s.to} to={s.to} className={claseLink}>
                {s.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
