"""
app/iced/core.py
----------------
PORT LITERAL de `iced_core.py` (algoritmo ICED ya validado). NO se
modifica ninguna regla de negocio: mismos mapas de dimension, misma
funcion de severidad de 4 niveles y misma formula del ICED (ponderado
y simple). Los servicios del backend SIEMPRE llaman a estas funciones;
no se recalcula nada "a mano".
"""

import pandas as pd

# =====================================================================
# 1) Reglas de asignacion de dimension (identicas a las hojas
#    Mapeo_Senal y Mapeo_Aspecto del workbook ICED_algoritmo_dropshipping.xlsx)
# =====================================================================

MAPA_SENAL = {
    "Proveedor_estafador": "Fraude",
    "Cobro_de_servicio_no_prestado": "Fraude",
    "Guia_Falsa": "Fraude",
    "Suplantacion_de_transportadora_cobro_anticipado": "Fraude",
    "Retencion_de_fondos": "Retencion_de_Fondos",
    "Perdida_de_mercancia": "Logistica",
    "Novedad_de_entrega_falsa": "Logistica",
}

MAPA_ASPECTO = {
    "Logistica_Transportadoras": "Logistica",
    "Retencion_Fondos": "Retencion_de_Fondos",
    "Soporte_Mala_Atencion": "Servicio_y_Soporte",
    "Servicio_Acompanamiento": "Servicio_y_Soporte",
    "Garantias_Devoluciones": "Devoluciones_y_Garantias",
    "Plataforma_Tecnica": "Plataformas",
    "Rendimiento_App": "Plataformas",
    "Proveedores_Confiabilidad": "Proveedores",
    "Estafas_Retencion": "Fraude",
    "Rentabilidad_Aprendizaje": "Fuera_de_Alcance",
    "Comunidad_Ecosistema": "Fuera_de_Alcance",
}

DIMENSIONES_RIESGO = [
    "Fraude", "Proveedores", "Logistica", "Retencion_de_Fondos",
    "Devoluciones_y_Garantias", "Plataformas", "Servicio_y_Soporte",
]

# Pesos de severidad por defecto (los usados en el algoritmo original)
PESOS_DEFAULT = {
    "Positivo": 0.00,
    "Neutro": 0.35,
    "Negativo_sin_fraude": 0.70,
    "Negativo_con_fraude": 1.00,
}


def asignar_dimension(row: pd.Series) -> str:
    """Regla de 2 niveles: Senal_Fraude tiene prioridad sobre Aspecto_Clave."""
    if row["Senal_Fraude"] in MAPA_SENAL:
        return MAPA_SENAL[row["Senal_Fraude"]]
    return MAPA_ASPECTO.get(row["Aspecto_Clave"], "Fuera_de_Alcance")


def calcular_severidad(row: pd.Series, pesos: dict) -> float:
    """Severidad de 4 niveles (no binaria) segun Polaridad y presencia
    de senal de fraude explicita."""
    if row["Polaridad"] == "Positivo":
        return pesos["Positivo"]
    if row["Polaridad"] == "Neutro":
        return pesos["Neutro"]
    # Negativo
    if row["Senal_Fraude"] != "Ninguna":
        return pesos["Negativo_con_fraude"]
    return pesos["Negativo_sin_fraude"]


def enriquecer(df: pd.DataFrame, pesos: dict = None) -> pd.DataFrame:
    """Devuelve una copia del dataset con Dimension_Riesgo, Fraude_Explicito
    y Severidad calculados. `pesos` permite variar la escala de severidad
    para los analisis de sensibilidad."""
    pesos = pesos or PESOS_DEFAULT
    out = df.copy()
    out["Dimension_Riesgo"] = out.apply(asignar_dimension, axis=1)
    out["Fraude_Explicito"] = out["Senal_Fraude"].apply(
        lambda x: "Si" if x != "Ninguna" else "No")
    out["Severidad"] = out.apply(lambda r: calcular_severidad(r, pesos), axis=1)
    return out


def resumen_por_dimension(df_enriquecido: pd.DataFrame):
    """Agrega severidad media, riesgo, confianza y peso de evidencia por
    cada una de las 7 dimensiones de riesgo (excluye Fuera_de_Alcance)."""
    sub = df_enriquecido[df_enriquecido["Dimension_Riesgo"] != "Fuera_de_Alcance"].copy()
    n_total = len(sub)

    resumen = (
        sub.groupby("Dimension_Riesgo")["Severidad"]
        .agg(N="count", Severidad_Media="mean")
        .reindex(DIMENSIONES_RIESGO)  # fuerza presencia y orden de las 7
    )
    resumen["N"] = resumen["N"].fillna(0).astype(int)
    resumen["Severidad_Media"] = resumen["Severidad_Media"].fillna(0.0)
    resumen["Dimension_Risk"] = (resumen["Severidad_Media"] * 100).round(2)
    resumen["Dimension_Confidence"] = (100 - resumen["Dimension_Risk"]).round(2)
    resumen["Peso_Evidencia"] = (resumen["N"] / n_total) if n_total > 0 else 0.0
    resumen = resumen.reset_index().rename(columns={"index": "Dimension_Riesgo"})
    return resumen, n_total


def calcular_iced(df: pd.DataFrame, pesos: dict = None):
    """Pipeline completo: dataset crudo -> ICED (ponderado y simple).

    Devuelve un dict con:
        iced_ponderado, iced_simple, indice_riesgo_ponderado,
        indice_riesgo_simple, resumen (DataFrame por dimension), n_total
    """
    enriquecido = enriquecer(df, pesos)
    resumen, n_total = resumen_por_dimension(enriquecido)

    riesgo_ponderado = float((resumen["Dimension_Risk"] * resumen["Peso_Evidencia"]).sum())
    iced_ponderado = round(100 - riesgo_ponderado, 2)

    iced_simple = round(resumen["Dimension_Confidence"].mean(), 2)

    return {
        "iced_ponderado": iced_ponderado,
        "indice_riesgo_ponderado": round(100 - iced_ponderado, 2),
        "iced_simple": iced_simple,
        "indice_riesgo_simple": round(100 - iced_simple, 2),
        "resumen": resumen,
        "n_total": n_total,
        "enriquecido": enriquecido,
    }
