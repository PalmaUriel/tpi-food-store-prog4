import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Reúne la Navbar y el contenido de la ruta actual (<Outlet />)
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
