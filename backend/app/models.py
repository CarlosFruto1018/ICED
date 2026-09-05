from datetime import datetime, timezone

from .extensions import db


def _utcnow():
    return datetime.now(timezone.utc)


class Registro(db.Model):
    __tablename__ = "registros"

    id = db.Column(db.String, primary_key=True)              # "C001"
    fuente = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.Date, nullable=True)                # NULL cuando el CSV trae "s.f."
    pais = db.Column(db.String, nullable=False)
    polaridad = db.Column(db.String, nullable=False)         # Positivo | Negativo | Neutro
    aspecto_clave = db.Column(db.String, nullable=False)
    senal_fraude = db.Column(db.String, nullable=False)      # "Ninguna" si no aplica
    texto_resumen = db.Column(db.Text, nullable=False)

    # Campos calculados (ver app/iced/core.py)
    dimension_riesgo = db.Column(db.String, nullable=False)
    fraude_explicito = db.Column(db.Boolean, nullable=False)
    severidad = db.Column(db.Numeric(3, 2), nullable=False)  # depende de configuracion_pesos vigente
    fuente_tipo = db.Column(db.String, nullable=False)
    anio = db.Column(db.Integer, nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "fuente": self.fuente,
            "url": self.url,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "pais": self.pais,
            "polaridad": self.polaridad,
            "aspecto_clave": self.aspecto_clave,
            "senal_fraude": self.senal_fraude,
            "texto_resumen": self.texto_resumen,
            "dimension_riesgo": self.dimension_riesgo,
            "fraude_explicito": self.fraude_explicito,
            "severidad": float(self.severidad),
            "fuente_tipo": self.fuente_tipo,
            "anio": self.anio,
        }


class ConfiguracionPesos(db.Model):
    __tablename__ = "configuracion_pesos"

    id = db.Column(db.Integer, primary_key=True)
    parametro = db.Column(db.String, unique=True, nullable=False)
    valor = db.Column(db.Numeric(3, 2), nullable=False)
    actualizado_en = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    def to_dict(self) -> dict:
        return {
            "parametro": self.parametro,
            "valor": float(self.valor),
            "actualizado_en": self.actualizado_en.isoformat() if self.actualizado_en else None,
        }
