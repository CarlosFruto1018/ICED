import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/dimensiones", label: "Dimensiones" },
  { to: "/registros", label: "Explorador" },
  { to: "/relaciones", label: "Relaciones cruzadas", fase: "Fase 2" },
  { to: "/validacion", label: "Validación", fase: "Fase 3" },
  { to: "/configuracion", label: "Configuración", fase: "Fase 3" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-full flex">
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 p-5 flex flex-col gap-6">
        <div>
          <div className="text-xl font-bold tracking-tight">ICED</div>
          <div className="text-xs text-slate-400 mt-1">
            Índice de Confiabilidad del Ecosistema de Dropshipping
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <span>{item.label}</span>
              {item.fase && (
                <span className="text-[10px] uppercase text-slate-500">
                  {item.fase}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-[11px] text-slate-500">
          MVP · Fase 1 · algoritmo validado (ICED = 30.05)
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-auto">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
