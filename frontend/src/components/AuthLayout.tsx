import type { ReactNode } from "react";

interface AuthLayoutProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
}

// Tarjeta centrada que comparten Login y Registro
export default function AuthLayout({ titulo, subtitulo, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            FS
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{titulo}</h1>
            <p className="text-sm text-slate-500">{subtitulo}</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}