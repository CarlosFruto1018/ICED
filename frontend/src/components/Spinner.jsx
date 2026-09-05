export default function Spinner({ label = "Cargando…" }) {
  return (
    <div className="flex items-center gap-3 text-slate-500 py-10 justify-center">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      {label}
    </div>
  );
}

export function ErrorBox({ error }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Error al cargar datos: {String(error?.message || error)}
    </div>
  );
}
