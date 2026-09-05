from flask import jsonify, request

from . import api_bp
from ..services.registros_service import listar_registros, obtener_registro


@api_bp.get("/registros")
def get_registros():
    return jsonify(listar_registros(request.args))


@api_bp.get("/registros/<registro_id>")
def get_registro(registro_id):
    data = obtener_registro(registro_id)
    if data is None:
        return jsonify(error="registro no encontrado"), 404
    return jsonify(data)
