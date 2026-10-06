# Stack tecnológico

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Recharts y Lucide React. Los cálculos y formatos financieros están en `frontend/src/lib/financial-utils.ts`.
- **Backend:** Python 3.13, FastAPI, Pydantic y Uvicorn. Las rutas y los modelos API están en `backend/app/routes.py`; la aplicación se crea en `backend/app/main.py`.
- **Pruebas:** Vitest en frontend y Pytest con FastAPI `TestClient` en backend.
- **Entorno de desarrollo:** Docker Compose define los servicios frontend y backend. Vite redirige `/api` a `http://backend:8000` dentro de la red de Compose.