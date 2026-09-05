from flask import Blueprint

api_bp = Blueprint("api", __name__, url_prefix="/api")

from . import dimensiones, iced, registros  # noqa: E402,F401
