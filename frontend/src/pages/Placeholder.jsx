export default function Placeholder({ titulo, fase, detalle }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{titulo}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {fase} — pendiente
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">{detalle}</p>
      </div>
    </div>
  );
}
