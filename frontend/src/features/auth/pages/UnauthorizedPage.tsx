import { Link } from "react-router-dom";
import Card from "../../../shared/ui/Card";

export default function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-10 text-center">
      <p className="mb-3 text-5xl">🔒</p>
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Sin permiso</h1>
      <p className="mb-6 text-slate-600">No tenés permisos para ver esta página.</p>
      <Link
        to="/"
        className="inline-block rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
      >
        Volver al inicio
      </Link>
    </Card>
  );
}
