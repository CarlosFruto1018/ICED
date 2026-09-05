import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Dimensiones from "./pages/Dimensiones.jsx";
import Explorador from "./pages/Explorador.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dimensiones" element={<Dimensiones />} />
        <Route path="/registros" element={<Explorador />} />
        <Route
          path="/relaciones"
          element={
            <Placeholder
              titulo="Relaciones cruzadas"
              fase="Fase 2"
              detalle="Barras Fuente×Polaridad, heatmap País×Aspecto, tendencia temporal y Fuente×%Fraude."
            />
          }
        />
        <Route
          path="/validacion"
          element={
            <Placeholder
              titulo="Validación"
              fase="Fase 3"
              detalle="Los 5 veredictos (PASA/FALLA) del análisis estadístico offline, incluido el Leave-One-Country-Out de Colombia."
            />
          }
        />
        <Route
          path="/configuracion"
          element={
            <Placeholder
              titulo="Configuración de pesos"
              fase="Fase 3"
              detalle="Sliders para Neutro, Negativo_sin_fraude y Negativo_con_fraude con recálculo en vivo del ICED."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
