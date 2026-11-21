import Card from "../../../shared/ui/Card";

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  color: string; // clase de Tailwind para la barra lateral
}

export default function TarjetaResumen({ titulo, valor, color }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 p-5 ${color}`}>
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800">{valor}</p>
    </Card>
  );
}
