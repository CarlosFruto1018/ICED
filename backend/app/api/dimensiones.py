from flask import jsonify

from . import api_bp
from ..services.dimensiones_service import tabla_dimensiones


@api_bp.get("/dimensiones")
def get_dimensiones():
    return jsonify(tabla_dimensiones())
