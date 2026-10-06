# Estado actual

- La pantalla principal (`frontend/src/App.tsx`) solo solicita `GET /api/metrics`; los endpoints analíticos adicionales del backend no están conectados a esa vista.
- El encabezado del frontend muestra `2024 - Full Year`, pero el generador del backend crea fechas relativas al año actual y al anterior. No asumir que la etiqueta coincide con los datos.
- Los tests existen, pero no se ejecutaron al redactar este contexto.
- La última comprobación de `docker compose ps` no mostró contenedores activos del proyecto. Por tanto, el estado de ejecución/accesibilidad no está confirmado. Compose configura puertos host `5173`, `8000` y `5678`; eso no garantiza que estén disponibles en el host.
- La configuración de CORS del backend permite todos los orígenes, métodos y encabezados junto con credenciales; debe revisarse antes de un despliegue.