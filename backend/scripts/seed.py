"""
scripts/seed.py
---------------
Migracion + seed de la base de datos ICED.

Hace 3 cosas:
  1. Crea las tablas (db.create_all()).
  2. Carga configuracion_pesos con los defaults validados.
  3. Carga los 187 registros de dataset_base.csv, calculando
     dimension_riesgo, fraude_explicito, severidad, fuente_tipo y anio
     con las MISMAS reglas de app/iced/core.py.

Uso:
    cd backend
    python -m scripts.seed            # crea + puebla (idempotente)
    python -m scripts.seed --reset    # borra y recarga todo
"""

import argparse
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from app import create_app
from app.extensions import db
from sqlalchemy import select
from app.iced.core import (
    PESOS_DEFAULT,
    asignar_dimension,
    calcular_severidad,
)
from app.models import ConfiguracionPesos, Registro

DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data"
DATASET_CSV = DATA_DIR / "dataset_base.csv"
MAPEO_CSV = DATA_DIR / "mapeo_fuente_tipo.csv"

_FECHA_COMPLETA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_SOLO_ANIO = re.compile(r"^\d{4}$")


def _parse_fecha_anio(valor: str):
    """Devuelve (fecha|None, anio|None) segun el contenido del CSV.
    - 'YYYY-MM-DD' -> date + anio
    - 'YYYY'       -> None + anio
    - 's.f.' / otro -> None + None
    """
    v = (valor or "").strip()
    if _FECHA_COMPLETA.match(v):
        d = datetime.strptime(v, "%Y-%m-%d").date()
        return d, d.year
    if _SOLO_ANIO.match(v):
        return None, int(v)
    return None, None


def cargar_mapeo_fuente_tipo() -> dict:
    m = pd.read_csv(MAPEO_CSV)
    return dict(zip(m["Fuente_Original"], m["Fuente_Tipo"]))


def seed_pesos():
    for parametro, valor in PESOS_DEFAULT.items():
        fila = ConfiguracionPesos.query.filter_by(parametro=parametro).one_or_none()
        if fila is None:
            db.session.add(ConfiguracionPesos(
                parametro=parametro, valor=valor,
                actualizado_en=datetime.now(timezone.utc),
            ))
    db.session.commit()
    print(f"  configuracion_pesos: {ConfiguracionPesos.query.count()} parametros")


def seed_registros():
    df = pd.read_csv(DATASET_CSV, dtype=str).fillna("")
    mapeo = cargar_mapeo_fuente_tipo()

    fuentes_sin_mapeo = sorted(set(df["Fuente"]) - set(mapeo))
    if fuentes_sin_mapeo:
        raise ValueError(
            "Fuentes sin entrada en mapeo_fuente_tipo.csv (no se inventa "
            f"agrupacion): {fuentes_sin_mapeo}"
        )

    existentes = set(db.session.scalars(select(Registro.id)).all())

    insertados = 0
    for _, row in df.iterrows():
        if row["ID"] in existentes:
            continue

        fecha, anio = _parse_fecha_anio(row["Fecha"])
        dimension = asignar_dimension(row)
        fraude_explicito = row["Senal_Fraude"] != "Ninguna"
        severidad = calcular_severidad(row, PESOS_DEFAULT)

        db.session.add(Registro(
            id=row["ID"],
            fuente=row["Fuente"],
            url=row["URL"],
            fecha=fecha,
            pais=row["Pais"],
            polaridad=row["Polaridad"],
            aspecto_clave=row["Aspecto_Clave"],
            senal_fraude=row["Senal_Fraude"],
            texto_resumen=row["Texto_del_Comentario_resumido"],
            dimension_riesgo=dimension,
            fraude_explicito=fraude_explicito,
            severidad=severidad,
            fuente_tipo=mapeo[row["Fuente"]],
            anio=anio,
        ))
        insertados += 1

    db.session.commit()
    print(f"  registros: {insertados} insertados, {Registro.query.count()} en total")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true",
                        help="Borra todas las tablas antes de recrear y poblar")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        if args.reset:
            print("Reset: drop_all()")
            db.drop_all()

        print("create_all()")
        db.create_all()

        print("Seed configuracion_pesos...")
        seed_pesos()

        print("Seed registros...")
        seed_registros()

        print("Listo.")


if __name__ == "__main__":
    main()
