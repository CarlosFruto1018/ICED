import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import Pagination from "../components/Pagination.jsx";
import Spinner, { ErrorBox } from "../components/Spinner.jsx";
import { ETIQUETAS } from "../components/DimensionBarChart.jsx";
import { useRegistros } from "../hooks/useRegistros.js";

const POLARIDADES = ["Positivo", "Neutro", "Negativo"];
const PAGE_SIZE = 25;

function Select({ label, value, onChange, options, format }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {format ? format(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Explorador() {
  const [opciones, setOpciones] = useState({ pais: [], fuente_tipo: [], dimension_riesgo: [] });
  const [filtros, setFiltros] = useState({
    pais: "",
    fuente_tipo: "",
    polaridad: "",
    dimension_riesgo: "",
    fraude_explicito: "",
  });
  const [page, setPage] = useState(1);

  // Catálogo de opciones (una sola carga de los 187)
  useEffect(() => {
    api.getRegistros({ page: 1, page_size: 200 }).then((d) => {
      const uniq = (k) => [...new Set(d.items.map((r) => r[k]))].sort();
      setOpciones({
        pais: uniq("pais"),
        fuente_tipo: uniq("fuente_tipo"),
        dimension_riesgo: uniq("dimension_riesgo"),
      });
    });
  }, []);

  const params = useMemo(
    () => ({ ...filtros, page, page_size: PAGE_SIZE }),
    [filtros, page],
  );
  const { data, error, loading } = useRegistros(params);

  function setFiltro(k, v) {
    setFiltros((f) => ({ ...f, [k]: v }));
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Explorador de registros</h1>
      <p className="mt-1 text-sm text-slate-500">
        187 registros semilla. Filtros combinables; cada fila enlaza a la fuente
        original.
      </p>

      <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Select
          label="País"
          value={filtros.pais}
          onChange={(v) => setFiltro("pais", v)}
          options={opciones.pais}
        />
        <Select
          label="Fuente (tipo)"
          value={filtros.fuente_tipo}
          onChange={(v) => setFiltro("fuente_tipo", v)}
          options={opciones.fuente_tipo}
        />
        <Select
          label="Polaridad"
          value={filtros.polaridad}
          onChange={(v) => setFiltro("polaridad", v)}
          options={POLARIDADES}
        />
        <Select
          label="Dimensión"
          value={filtros.dimension_riesgo}
          onChange={(v) => setFiltro("dimension_riesgo", v)}
          options={opciones.dimension_riesgo}
          format={(o) => ETIQUETAS[o] || o}
        />
        <Select
          label="Fraude explícito"
          value={filtros.fraude_explicito}
          onChange={(v) => setFiltro("fraude_explicito", v)}
          options={["true", "false"]}
          format={(o) => (o === "true" ? "Sí" : "No")}
        />
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorBox error={error} />
        ) : loading || !data ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">País</th>
                    <th className="px-3 py-3">Fuente</th>
                    <th className="px-3 py-3">Polaridad</th>
                    <th className="px-3 py-3">Dimensión</th>
                    <th className="px-3 py-3 text-right">Sev.</th>
                    <th className="px-3 py-3">Texto</th>
                    <th className="px-3 py-3">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.pais}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">
                        {r.fuente_tipo}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            r.polaridad === "Negativo"
                              ? "bg-red-100 text-red-700"
                              : r.polaridad === "Positivo"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.polaridad}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs">
                        {ETIQUETAS[r.dimension_riesgo] || r.dimension_riesgo}
                        {r.fraude_explicito && (
                          <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                            fraude
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {r.severidad.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 max-w-md text-xs text-slate-600">
                        {r.texto_resumen}
                      </td>
                      <td className="px-3 py-3">
                        <a
                          className="text-xs text-blue-600 hover:underline"
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          abrir ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-8 text-center text-sm text-slate-400"
                      >
                        Sin registros para estos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Pagination
                page={data.page}
                totalPages={data.total_pages}
                total={data.total}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
