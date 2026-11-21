import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 text-5xl">🔒</span>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Acceso denegado</h1>
      <p className="mb-6 text-slate-600">No tenés permisos para ver esta página.</p>
      <Link
        to="/categories"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}