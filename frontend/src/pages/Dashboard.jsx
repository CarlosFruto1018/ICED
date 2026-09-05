import GaugeICED from "../components/GaugeICED.jsx";
import KpiCard from "../components/KpiCard.jsx";
import Spinner, { ErrorBox } from "../components/Spinner.jsx";
import { ETIQUETAS } from "../components/DimensionBarChart.jsx";
import { useDimensiones } from "../hooks/useDimensiones.js";
import { useIced } from "../hooks/useIced.js";

export default function Dashboard() {
  const { data: iced, error: e1, loading: l1 } = useIced();
  const { data: dims, error: e2, loading: l2 } = useDimensiones();

  if (l1 || l2) return <Spinner />;
  if (e1 || e2) return <ErrorBox error={e1 || e2} />;

  const totalFraude = dims.reduce((a, d) => a + d.n_fraude_explicito, 0);
  const totalConRiesgo = dims.reduce((a, d) => a + d.n, 0);
  const pctFraude = totalConRiesgo
    ? ((totalFraude / totalConRiesgo) * 100).toFixed(1)
    : "0";
  const masRiesgosa = [...dims].sort(
    (a, b) => b.dimension_risk - a.dimension_risk,
  )[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Índice de Confiabilidad del Ecosistema de Dropshipping · algoritmo
        validado (bootstrap IC 95%: 25.73–34.48).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            ICED actual (ponderado)
          </div>
          <GaugeICED
            valor={iced.iced_ponderado}
            etiqueta="ICED"
            sub={`Índice de Riesgo complementario: ${iced.indice_riesgo_ponderado}`}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">
            Índice de Riesgo (100 − ICED)
          </div>
          <GaugeICED
            valor={iced.indice_riesgo_ponderado}
            etiqueta="Riesgo"
            sub={`ICED simple (no ponderado): ${iced.iced_simple}`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          titulo="N total dataset"
          valor={iced.n_total_dataset}
          detalle={`${iced.n_total_con_riesgo} con dimensión de riesgo`}
        />
        <KpiCard
          titulo="% con señal de fraude"
          valor={`${pctFraude}%`}
          detalle={`${totalFraude} registros con Senal_Fraude ≠ Ninguna`}
        />
        <KpiCard titulo="País dominante" valor="Colombia" detalle="≈ 69.5% de la evidencia" />
        <KpiCard
          titulo="Dimensión más riesgosa"
          valor={ETIQUETAS[masRiesgosa.dimension] || masRiesgosa.dimension}
          detalle={`Dimension_Risk = ${masRiesgosa.dimension_risk}`}
        />
      </div>
    </div>
  );
}
