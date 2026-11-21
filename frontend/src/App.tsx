import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsersPage from "./pages/AdminUsersPage";
import CategoriesPage from "./pages/CategoriesPage";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { useAuthStore } from "./store/authStore";

function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  // Al iniciar (o recargar) la app se confirma la sesión con GET /auth/me (HU-04)
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        {/* Solo admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/* "/" y cualquier ruta desconocida -> categorías (o login, si no hay sesión) */}
        <Route path="*" element={<Navigate to="/categories" replace />} />
      </Routes>
    </>
  );
}

export default App;