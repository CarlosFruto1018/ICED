import DimensionBarChart, { ETIQUETAS } from "../components/DimensionBarChart.jsx";
import Spinner, { ErrorBox } from "../components/Spinner.jsx";
import { useDimensiones } from "../hooks/useDimensiones.js";

export default function Dimensiones() {
  const { data, error, loading } = useDimensiones();

  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;

  const orden = [...data].sort((a, b) => b.dimension_risk - a.dimension_risk);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">
        7 dimensiones de riesgo
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Ordenadas por <code>Dimension_Risk</code> (severidad media × 100). Rojo =
        alto riesgo, verde = bajo riesgo.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <DimensionBarChart data={data} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Dimensión</th>
              <th className="px-4 py-3 text-right">N</th>
              <th className="px-4 py-3 text-right">Dimension_Risk</th>
              <th className="px-4 py-3 text-right">Confidence</th>
              <th className="px-4 py-3 text-right">Peso evidencia</th>
              <th className="px-4 py-3 text-right">% neg</th>
              <th className="px-4 py-3 text-right">% neutro</th>
              <th className="px-4 py-3 text-right">% pos</th>
              <th className="px-4 py-3 text-right">% fraude expl.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orden.map((d) => (
              <tr key={d.dimension}>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {ETIQUETAS[d.dimension] || d.dimension}
                  {d.n === 1 && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      n=1
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{d.n}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {d.dimension_risk}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.dimension_confidence}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {(d.peso_evidencia * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.pct_negativo}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.pct_neutro}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.pct_positivo}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {d.pct_fraude_explicito}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
