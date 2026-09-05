# ICED — Aplicación web

Interfaz web del **Índice de Confiabilidad del Ecosistema de Dropshipping (ICED)**, un
algoritmo ya validado estadísticamente. El backend porta `iced_core.py` sin cambiar
ninguna regla de negocio; el frontend lo consume.

- `backend/` — API REST en Flask + SQLAlchemy sobre PostgreSQL.
- `frontend/` — SPA en React (Vite) + Tailwind + Recharts.
- `docker-compose.yml` — Postgres local para desarrollo.

## Estado: Fase 1 (MVP)

| Componente | Incluido |
|---|---|
| Modelo de datos + seed (187 registros, pesos por defecto) | ✅ |
| `GET /api/iced`, `/api/dimensiones`, `/api/registros`, `/api/registros/<id>` | ✅ |
| Páginas Dashboard, Dimensiones, Explorador | ✅ |
| Relaciones cruzadas (Fase 2) | ⏳ placeholder |
| Configuración de pesos en vivo + Validación (Fase 3) | ⏳ placeholder |
| Auth Supabase (Fase 4) | ⏳ |

## Arranque rápido

```bash
# Postgres
docker compose up -d

# Backend  (ver backend/README.md para detalle)
cd backend
python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
python -m scripts.seed --reset
python wsgi.py                      # http://localhost:5000

# Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev                         # http://localhost:5173
```

## Paridad con el algoritmo validado

`backend/tests/test_paridad_iced.py` bloquea el resultado de referencia:
**ICED ponderado = 30.05** (IC 95% bootstrap 25.73–34.48, según `README_Validacion.md`).
