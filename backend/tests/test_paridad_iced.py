"""
test_paridad_iced.py
--------------------
Verifica que el port literal de app/iced/core.py reproduce EXACTAMENTE
el resultado del algoritmo validado sobre dataset_base.csv:

    ICED base (ponderado) = 30.05   (ver README_Validacion.md)

No toca la base de datos: corre el algoritmo directamente sobre el CSV
semilla, que es la misma fuente de verdad que usa el seed.
"""

from pathlib import Path

import pandas as pd

from app.iced.core import calcular_iced

CSV = Path(__file__).resolve().parent.parent / "app" / "data" / "dataset_base.csv"


def test_iced_base_ponderado_es_30_05():
    df = pd.read_csv(CSV, dtype=str).fillna("")
    r = calcular_iced(df)
    assert r["iced_ponderado"] == 30.05
    assert r["indice_riesgo_ponderado"] == 69.95
    assert r["n_total"] == 181


def test_dimension_mas_riesgosa_es_fraude():
    df = pd.read_csv(CSV, dtype=str).fillna("")
    r = calcular_iced(df)
    top = r["resumen"].sort_values("Dimension_Risk", ascending=False).iloc[0]
    assert top["Dimension_Riesgo"] == "Fraude"
