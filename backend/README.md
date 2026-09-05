# ICED — Backend (Flask + SQLAlchemy + Postgres)

Port literal del algoritmo validado `iced_core.py` a una API REST. **Ninguna regla de
negocio se reescribe**: `app/iced/core.py` es copia fiel de los mapas de dimensión, la
severidad de 4 niveles y la fórmula del ICED (ponderado y simple).

## Requisitos

- Python 3.12
- PostgreSQL (local vía `docker-compose.yml` en la raíz, o Supabase)

## Puesta en marcha (Fase 1)

```bash
# 1. Postgres local
cd ..
docker compose up -d

# 2. Entorno Python
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows;  source .venv/bin/activate en Linux/Mac
pip install -r requirements.txt

# 3. Variables de entorno
cp .env.example .env          # DATABASE_URL ya apunta al Postgres de docker-compose

# 4. Migración + seed (crea tablas, carga pesos y los 187 registros)
python -m scripts.seed --reset

# 5. API
flask --app wsgi run --port 5000      # o:  python wsgi.py
```

### Cambiar a Supabase

Solo se edita `DATABASE_URL` en `.env` por la connection string del proyecto
(`postgresql+psycopg://postgres:...@db.<ref>.supabase.co:5432/postgres`). Nada del
código se acopla a Supabase.

## Endpoints (Fase 1)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/iced` | ICED ponderado/simple + índices de riesgo + N |
| GET | `/api/dimensiones` | 7 dimensiones con N, severidad, risk/confidence, % polaridad y % fraude |
| GET | `/api/registros` | Lista paginada; filtros `pais, fuente_tipo, polaridad, dimension_riesgo, fraude_explicito, page, page_size` |
| GET | `/api/registros/<id>` | Un registro completo |
| GET | `/health` | Healthcheck |

Rutas de Fases 2–3 (`/api/relaciones/*`, `/api/pesos`, `/api/validacion`) aún no montadas.

## Tests

```bash
pytest -q
```

`tests/test_paridad_iced.py` verifica la paridad con el algoritmo validado:
**ICED ponderado = 30.05**, índice de riesgo = 69.95, N con dimensión = 181, dimensión
más riesgosa = Fraude.

## Modelo de datos

- `registros` — 187 filas. `dimension_riesgo`, `fraude_explicito` y `fuente_tipo` se
  calculan una sola vez en el seed. `severidad` se denormaliza y se **recalculará** en
  `PUT /api/pesos` (Fase 3). `fecha` es `NULL` cuando el CSV trae `s.f.` o solo el año;
  `anio` se extrae del año cuando existe.
- `configuracion_pesos` — 4 parámetros (`Positivo=0.00, Neutro=0.35,
  Negativo_sin_fraude=0.70, Negativo_con_fraude=1.00`).
- `fuente_tipo` sale de `app/data/mapeo_fuente_tipo.csv` (lookup exacto; si aparece una
  Fuente no mapeada el seed falla en vez de inventar un grupo).
