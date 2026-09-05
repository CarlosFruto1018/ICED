"""
iced_service.py
---------------
Puente entre la tabla `registros` de Postgres y el port literal del
algoritmo (`app/iced/core.py`).

Estrategia: se reconstruye el DataFrame CRUDO (mismas 9 columnas del
CSV original) a partir de las filas de la BD y se pasa junto con los
pesos vigentes a `calcular_iced()`. Asi el calculo es byte-for-byte el
del algoritmo validado; la columna `severidad` almacenada es solo una
denormalizacion para el Explorador y se refresca en PUT /api/pesos.
"""

import pandas as pd

from ..iced.core import PESOS_DEFAULT, calcular_iced
from ..models import ConfiguracionPesos, Registro

# Columnas crudas que espera app/iced/core.py
_COLS_CRUDAS = [
    "ID", "Fuente", "URL", "Fecha", "Pais", "Polaridad",
    "Aspecto_Clave", "Senal_Fraude", "Texto_del_Comentario_resumido",
]


def pesos_vigentes() -> dict:
    """Lee configuracion_pesos y devuelve el dict con la forma que espera
    el algoritmo. Si falta algun parametro cae al default validado."""
    filas = ConfiguracionPesos.query.all()
    pesos = dict(PESOS_DEFAULT)
    for f in filas:
        pesos[f.parametro] = float(f.valor)
    return pesos


def _df_crudo() -> pd.DataFrame:
    filas = Registro.query.all()
    data = [
        {
            "ID": r.id,
            "Fuente": r.fuente,
            "URL": r.url,
            "Fecha": r.fecha.isoformat() if r.fecha else "s.f.",
            "Pais": r.pais,
            "Polaridad": r.polaridad,
            "Aspecto_Clave": r.aspecto_clave,
            "Senal_Fraude": r.senal_fraude,
            "Texto_del_Comentario_resumido": r.texto_resumen,
        }
        for r in filas
    ]
    return pd.DataFrame(data, columns=_COLS_CRUDAS)


def calcular_iced_actual() -> dict:
    """Ejecuta el algoritmo sobre TODO el dataset con los pesos vigentes."""
    df = _df_crudo()
    resultado = calcular_iced(df, pesos_vigentes())
    resultado["n_total_dataset"] = int(len(df))
    return resultado


def payload_iced() -> dict:
    r = calcular_iced_actual()
    return {
        "iced_ponderado": r["iced_ponderado"],
        "indice_riesgo_ponderado": r["indice_riesgo_ponderado"],
        "iced_simple": r["iced_simple"],
        "indice_riesgo_simple": r["indice_riesgo_simple"],
        "n_total_con_riesgo": int(r["n_total"]),
        "n_total_dataset": r["n_total_dataset"],
    }
