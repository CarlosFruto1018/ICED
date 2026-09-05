"""
registros_service.py
--------------------
Listado paginado y filtrable de la tabla `registros`. Todos los
filtros son opcionales y combinables.
"""

from ..extensions import db
from ..models import Registro

_MAX_PAGE_SIZE = 200


def _parse_bool(valor: str | None):
    if valor is None or valor == "":
        return None
    return valor.strip().lower() in ("1", "true", "t", "si", "sí", "yes")


def listar_registros(args) -> dict:
    q = Registro.query

    pais = args.get("pais")
    fuente_tipo = args.get("fuente_tipo")
    polaridad = args.get("polaridad")
    dimension_riesgo = args.get("dimension_riesgo")
    fraude_explicito = _parse_bool(args.get("fraude_explicito"))

    if pais:
        q = q.filter(Registro.pais == pais)
    if fuente_tipo:
        q = q.filter(Registro.fuente_tipo == fuente_tipo)
    if polaridad:
        q = q.filter(Registro.polaridad == polaridad)
    if dimension_riesgo:
        q = q.filter(Registro.dimension_riesgo == dimension_riesgo)
    if fraude_explicito is not None:
        q = q.filter(Registro.fraude_explicito.is_(fraude_explicito))

    try:
        page = max(int(args.get("page", 1)), 1)
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = int(args.get("page_size", 25))
    except (TypeError, ValueError):
        page_size = 25
    page_size = min(max(page_size, 1), _MAX_PAGE_SIZE)

    total = q.count()
    items = (
        q.order_by(Registro.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [r.to_dict() for r in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size if page_size else 0,
    }


def obtener_registro(registro_id: str) -> dict | None:
    r = db.session.get(Registro, registro_id)
    return r.to_dict() if r else None
