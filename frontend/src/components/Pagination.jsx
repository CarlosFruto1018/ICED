export default function Pagination({ page, totalPages, total, onChange }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>
        {total} registros · página {page} de {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-1 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ← Anterior
        </button>
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-1 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
