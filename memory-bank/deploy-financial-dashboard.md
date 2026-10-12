# Skill interna: deploy-financial-dashboard

## Por qué se creó

Las skills disponibles cubrían auditoría web, React, accesibilidad y pruebas, pero no el flujo operativo propio de este repositorio para desplegar juntos el frontend React/Vite y el backend FastAPI. La skill se creó para cerrar ese vacío y prevenir errores de proxy, red y CORS, además de distinguir de forma explícita la configuración de desarrollo de la de producción.

## Alcance

- Inspeccionar los Dockerfiles, Compose, proxy de Vite y plantilla de Nginx antes de preparar un despliegue.
- Construir imágenes separadas de frontend y backend con tags explícitos.
- Configurar una red privada y el upstream `API_UPSTREAM` para el proxy de Nginx, o `VITE_API_BASE_URL` y CORS para una API pública.
- Limitar CORS a orígenes exactos y evitar credenciales salvo que la aplicación las necesite.
- Comprobar el endpoint `GET /api/metrics` y validar que responde una lista JSON no vacía con el contrato de movimientos.
- Detenerse si el backend no cuenta con un arranque de producción; no presentar datos simulados como datos reales.

La guía canónica está en `.skills/deploy-financial-dashboard/SKILL.md`; `.agents/skills/deploy-financial-dashboard/SKILL.md` la referencia para mantener el descubrimiento de skills del proyecto. No despliega en servicios externos ni gestiona secretos por sí misma.

## Resultado de la prueba

Se ejecutó el preflight local de la skill en modo `nginx-proxy`, contrastándolo con la configuración real del repositorio:

- El `backend/Dockerfile` solo tiene un comando con `debugpy` y `uvicorn --reload`; no hay target de producción seguro. La skill identificó esto como bloqueo y no construyó ni publicó imágenes.
- `backend/app/main.py` permite `*` en orígenes, métodos y encabezados, además de credenciales. Hace falta restringir esta configuración antes de desplegar.
- No había contenedores activos, así que no se pudo probar el proxy HTTP en ejecución ni completar la prueba de humo pública.
- Los tests focalizados del contrato de rutas sí se ejecutaron: `cd backend && python -m pytest -q tests/test_routes.py` dio **15 passed** y una advertencia de deprecación de `starlette.testclient` relacionada con `httpx`.

Resultado: el preflight y el contrato del API quedaron verificados; la construcción de las dos imágenes, la verificación positiva/negativa de CORS y la prueba de humo contra un despliegue activo siguen pendientes. No se considera un despliegue exitoso.