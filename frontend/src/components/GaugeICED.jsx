import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

// ICED alto = ecosistema confiable (verde); ICED bajo = riesgoso (rojo)
function colorPara(valor) {
  if (valor >= 70) return "#16a34a";
  if (valor >= 50) return "#65a30d";
  if (valor >= 35) return "#d97706";
  return "#dc2626";
}

export default function GaugeICED({ valor, etiqueta = "ICED", sub }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  const data = [{ name: etiqueta, value: v, fill: colorPara(v) }];

  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "#e2e8f0" }}
            dataKey="value"
            cornerRadius={999}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold tabular-nums text-slate-800">
          {v.toFixed(2)}
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {etiqueta} · escala 0–100
        </div>
        {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}
