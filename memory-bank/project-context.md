# Contexto del proyecto

## Descripción del producto

Dashboard de métricas financieras para visualizar ingresos, gastos, beneficio y margen, además de tendencias mensuales. El frontend obtiene movimientos desde una API y calcula los indicadores y agrupaciones que presenta. El backend ofrece también endpoints de resumen, categorías principales, comparación de periodos, alertas y filtros B2B/B2C.

La aplicación está en estado de demostración: los movimientos se generan en memoria con datos simulados en `backend/app/routes.py`; no se observa persistencia en base de datos. `frontend/src/lib/mock-data.ts` tiene otro conjunto de muestra, pero no es la fuente que consume `App.tsx`.

## Stack tecnológico

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Recharts y Lucide React. Los cálculos y formatos financieros están en `frontend/src/lib/financial-utils.ts`.
- **Backend:** Python 3.13, FastAPI, Pydantic y Uvicorn. Las rutas y los modelos API están en `backend/app/routes.py`; la aplicación se crea en `backend/app/main.py`.
- **Pruebas:** Vitest en frontend y Pytest con FastAPI `TestClient` en backend.
- **Entorno de desarrollo:** Docker Compose define los servicios frontend y backend. Vite redirige `/api` a `http://backend:8000` dentro de la red de Compose.

## Estado actual

- La pantalla principal (`frontend/src/App.tsx`) solo solicita `GET /api/metrics`; los endpoints analíticos adicionales del backend no están conectados a esa vista.
- El encabezado del frontend muestra `2024 - Full Year`, pero el generador del backend crea fechas relativas al año actual y al anterior. No asumir que la etiqueta coincide con los datos.
- Los tests existen, pero no se ejecutaron al redactar este contexto.
- La última comprobación de `docker compose ps` no mostró contenedores activos del proyecto. Por tanto, el estado de ejecución/accesibilidad no está confirmado. Compose configura puertos host `5173`, `8000` y `5678`; eso no garantiza que estén disponibles en el host.
- La configuración de CORS del backend permite todos los orígenes, métodos y encabezados junto con credenciales; debe revisarse antes de un despliegue.

## Puntos de entrada

- Frontend: `frontend/src/main.tsx` monta `frontend/src/App.tsx`.
- Backend: `backend/app/main.py` crea FastAPI e incluye el router de `backend/app/routes.py`.
- Arranque en contenedores: `docker-compose.yml`; la documentación local está en `README.es.md`.
