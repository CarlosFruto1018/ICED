"""
dimensiones_service.py
----------------------
Construye la tabla de 7 dimensiones para GET /api/dimensiones.

El nucleo (N, severidad_media, dimension_risk, dimension_confidence,
peso_evidencia) viene TAL CUAL de `resumen_por_dimension()` del port
literal. Los campos extra de la API (% por polaridad y fraude
explicito) se agregan aparte sobre el DataFrame enriquecido que
devuelve `calcular_iced()`.
"""

from ..iced.core import DIMENSIONES_RIESGO
from .iced_service import calcular_iced_actual


def _pct(parte: int, total: int) -> float:
    return round(parte / total * 100, 2) if total else 0.0


def tabla_dimensiones() -> list[dict]:
    r = calcular_iced_actual()
    resumen = r["resumen"].set_index("Dimension_Riesgo")
    enr = r["enriquecido"]
    enr = enr[enr["Dimension_Riesgo"] != "Fuera_de_Alcance"]

    filas = []
    for dim in DIMENSIONES_RIESGO:
        fila_r = resumen.loc[dim]
        grupo = enr[enr["Dimension_Riesgo"] == dim]
        n = int(fila_r["N"])
        n_neg = int((grupo["Polaridad"] == "Negativo").sum())
        n_neu = int((grupo["Polaridad"] == "Neutro").sum())
        n_pos = int((grupo["Polaridad"] == "Positivo").sum())
        n_fraude = int((grupo["Fraude_Explicito"] == "Si").sum())

        filas.append({
            "dimension": dim,
            "n": n,
            "severidad_media": round(float(fila_r["Severidad_Media"]), 4),
            "dimension_risk": round(float(fila_r["Dimension_Risk"]), 2),
            "dimension_confidence": round(float(fila_r["Dimension_Confidence"]), 2),
            "peso_evidencia": round(float(fila_r["Peso_Evidencia"]), 4),
            "pct_negativo": _pct(n_neg, n),
            "pct_neutro": _pct(n_neu, n),
            "pct_positivo": _pct(n_pos, n),
            "n_fraude_explicito": n_fraude,
            "pct_fraude_explicito": _pct(n_fraude, n),
        })

    filas.sort(key=lambda x: x["dimension_risk"], reverse=True)
    return filas
