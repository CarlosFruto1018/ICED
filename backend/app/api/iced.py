from flask import jsonify

from . import api_bp
from ..services.iced_service import payload_iced


@api_bp.get("/iced")
def get_iced():
    return jsonify(payload_iced())
