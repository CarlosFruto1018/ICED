import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Rojo (riesgo alto) -> verde (riesgo bajo) segun Dimension_Risk (0-100)
function colorRiesgo(risk) {
  if (risk >= 80) return "#dc2626";
  if (risk >= 60) return "#ea580c";
  if (risk >= 45) return "#d97706";
  if (risk >= 30) return "#ca8a04";
  return "#16a34a";
}

const ETIQUETAS = {
  Fraude: "Fraude",
  Proveedores: "Proveedores",
  Logistica: "Logística",
  Retencion_de_Fondos: "Retención de Fondos",
  Devoluciones_y_Garantias: "Devoluciones y Garantías",
  Plataformas: "Plataformas",
  Servicio_y_Soporte: "Servicio y Soporte",
};

function TooltipContenido({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 text-xs shadow-md">
      <div className="font-semibold text-slate-800">
        {ETIQUETAS[d.dimension] || d.dimension}
      </div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-600">
        <span>Dimension_Risk</span>
        <span className="text-right font-medium">{d.dimension_risk}</span>
        <span>N registros</span>
        <span className="text-right font-medium">{d.n}</span>
        <span>% negativo</span>
        <span className="text-right font-medium">{d.pct_negativo}%</span>
        <span>% fraude explícito</span>
        <span className="text-right font-medium">{d.pct_fraude_explicito}%</span>
        <span>Peso evidencia</span>
        <span className="text-right font-medium">
          {(d.peso_evidencia * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function DimensionBarChart({ data }) {
  const filas = [...data]
    .sort((a, b) => a.dimension_risk - b.dimension_risk)
    .map((d) => ({ ...d, label: ETIQUETAS[d.dimension] || d.dimension }));

  return (
    <div style={{ height: filas.length * 52 + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={filas}
          margin={{ top: 8, right: 40, bottom: 8, left: 150 }}
        >
          <XAxis type="number" domain={[0, 100]} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={150}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<TooltipContenido />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey="dimension_risk" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12, fill: "#475569" }}>
            {filas.map((d) => (
              <Cell key={d.dimension} fill={colorRiesgo(d.dimension_risk)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ETIQUETAS };
