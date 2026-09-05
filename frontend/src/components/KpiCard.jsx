export default function KpiCard({ titulo, valor, detalle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {titulo}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-800">{valor}</div>
      {detalle && <div className="mt-1 text-xs text-slate-500">{detalle}</div>}
    </div>
  );
}
