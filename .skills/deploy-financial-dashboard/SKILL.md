---
name: deploy-financial-dashboard
description: "Construye, configura y verifica el despliegue Docker del dashboard financiero React/Vite + FastAPI. Úsala para preparar o desplegar ambos servicios, configurar proxy/red y CORS, y validar GET /api/metrics."
---

# Desplegar el dashboard financiero

## Objetivo

Desplegar el frontend y el backend como imágenes separadas, con una ruta de red válida entre ambos, CORS limitado al origen previsto y una prueba de humo reproducible contra `/api/metrics`. Mantener explícita la diferencia entre desarrollo y producción.

El repositorio usa datos simulados generados por el backend; no describirlos como datos financieros persistidos o reales.

## Inputs definidos

Solicitar o confirmar los siguientes valores antes de construir imágenes para un entorno compartido o publicar el despliegue. No solicitar secretos en el chat; los secretos, si el backend llegara a necesitarlos, se inyectan en el entorno seguro del operador.

| Input | Requerido | Descripción |
| --- | --- | --- |
| `ENVIRONMENT` | Sí | Entorno destino, por ejemplo `staging` o `production`. |
| `IMAGE_REGISTRY` | Sí para publicar | Registry y namespace, por ejemplo `registry.example.com/finance`. |
| `IMAGE_TAG` | Sí | Tag de release único e inmutable; no usar `latest` como única referencia. |
| `DEPLOYMENT_MODE` | Sí | `nginx-proxy` o `direct-api`. |
| `FRONTEND_ORIGIN` | Sí | Origen público del frontend, esquema y host, sin ruta; por ejemplo `https://dashboard.example.com`. |
| `API_ORIGIN` | Solo `direct-api` | Origen público del backend, esquema y host, sin ruta. |
| `API_UPSTREAM` | Solo `nginx-proxy` | Dirección interna resoluble del backend desde Nginx, incluyendo puerto; por ejemplo `http://backend:8000`. |
| `APP_NETWORK` | Sí si se usa Docker en un host | Red compartida que permite al frontend resolver el backend. En un orquestador, identificar la red o el servicio DNS equivalente. |
| `HOST_PORT` | Si se publica directamente con Docker | Puerto host para el frontend. El backend no debe publicarse al host por defecto. |
| `CORS_ORIGINS` | Sí | Lista exacta de orígenes que deben poder llamar al API desde un navegador. Nunca usar `*` en producción. |
| `BACKEND_PRODUCTION_TARGET` | Sí | Etapa/imagen y comando de arranque del backend sin `debugpy` ni `uvicorn --reload`. |

Si falta un input obligatorio, pedirlo antes de publicar. Para una comprobación local, se pueden usar valores locales explícitos, pero etiquetar el resultado como local y no como despliegue de producción.

## Output esperado

Entregar un resumen de despliegue que incluya:

- Tags completos de las imágenes frontend y backend, y resultado de sus builds.
- Modo de conexión seleccionado y diagrama textual breve: navegador → Nginx/API y frontend → backend.
- Nombre de red y destino de proxy, o URL pública de API si se eligió `direct-api`.
- Orígenes CORS permitidos y verificación de que un origen ajeno no recibe permiso.
- Resultado HTTP y validación JSON de `GET <FRONTEND_ORIGIN>/api/metrics`.
- Bloqueos, cambios de configuración requeridos y comandos ejecutados. No incluir secretos.

## Procedimiento

### 1. Inspeccionar y elegir el modo

Revisar `README.es.md`, `docker-compose.yml`, ambos Dockerfiles, `frontend/nginx.conf.template`, la configuración de proxy de Vite y `backend/app/main.py` antes de cambiar valores. Confirmar el endpoint real y el modelo de respuesta en `backend/app/routes.py`.

- `nginx-proxy` es el modo preferido cuando frontend y backend están en una red privada compartida. Construir el frontend con `VITE_API_BASE_URL` vacío y configurar Nginx con `API_UPSTREAM` apuntando al servicio backend. El navegador llama al mismo origen del frontend.
- `direct-api` hace que el navegador llame a la API pública. Construir el frontend con `VITE_API_BASE_URL` igual a `API_ORIGIN`; configurar CORS para aceptar exactamente `FRONTEND_ORIGIN`.
- No usar el proxy de Vite ni el target de desarrollo de Compose como configuración de producción.

### 2. Comprobar el backend de producción

Inspeccionar el comando de arranque y el target seleccionado. El Dockerfile actual del backend arranca `debugpy` y Uvicorn con `--reload`; esa configuración es de desarrollo, no una imagen de producción.

Si no existe una imagen/etapa de producción, detener el despliegue. Informar del bloqueo y preparar un target de producción con Uvicorn sin `debugpy` ni `--reload` solo como parte de un cambio autorizado. No construir ni etiquetar silenciosamente la imagen de desarrollo como producción. Reconstruir y ejecutar las pruebas del backend después de cambiar su arranque.

### 3. Limitar CORS

Revisar `backend/app/main.py`. Si permite `*`, sustituirlo para el entorno desplegado por la lista exacta `CORS_ORIGINS`; no copiar la política de desarrollo a producción. Si se introduce configuración por entorno, analizarla como orígenes explícitos separados por coma y fallar de forma clara ante valores inválidos.

- Permitir solo los métodos y encabezados necesarios; el dashboard necesita `GET` y no requiere credenciales por defecto.
- Mantener `allow_credentials` desactivado salvo que exista un flujo real de cookies/credenciales; en ese caso, configurar orígenes exactos y nunca `*`.
- En modo `nginx-proxy`, incluir únicamente los orígenes de navegador que realmente deben llamar al API. En modo `direct-api`, incluir `FRONTEND_ORIGIN`.
- Verificar la configuración positiva con el origen autorizado y la negativa con un origen no autorizado. Si se modifica código, ejecutar las pruebas backend pertinentes y reconstruir la imagen antes de desplegarla.

### 4. Construir las imágenes

Usar tags únicos del entorno. El frontend tiene un target de producción llamado `production`; comprobar que el backend también apunta al target de producción validado en el paso anterior.

Para `nginx-proxy`:

```bash
docker build --target production \
  -t "${IMAGE_REGISTRY}/financial-dashboard-backend:${IMAGE_TAG}" ./backend

docker build --target production \
  --build-arg VITE_API_BASE_URL= \
  -t "${IMAGE_REGISTRY}/financial-dashboard-frontend:${IMAGE_TAG}" ./frontend
```

Para `direct-api`, construir el frontend con la URL pública de API, ya que Vite incorpora ese valor al bundle:

```bash
docker build --target production \
  --build-arg "VITE_API_BASE_URL=${API_ORIGIN}" \
  -t "${IMAGE_REGISTRY}/financial-dashboard-frontend:${IMAGE_TAG}" ./frontend
```

No incluir credenciales ni secretos en `ARG`, `ENV`, argumentos de build o en el bundle. Si se publican las imágenes, subir ambos tags al registry y verificar que el entorno destino puede descargarlos.

### 5. Configurar red, backend y proxy

En Docker sobre un host único, verificar la red antes de crearla:

```bash
docker network inspect "${APP_NETWORK}" >/dev/null 2>&1 || \
  docker network create "${APP_NETWORK}"
```

Conectar los contenedores del backend y frontend a esa misma red. Asignar al backend un alias DNS estable como `backend`; en `nginx-proxy`, configurar `API_UPSTREAM=http://backend:8000` (o el destino interno confirmado). Publicar el puerto del frontend; mantener privado el puerto del backend salvo que `direct-api` o la plataforma lo requiera expresamente.

En otra plataforma, traducir esta topología a su red privada y service discovery. No asumir que `localhost` dentro del contenedor frontend apunta al backend.

### 6. Verificar el despliegue

Esperar a que ambos servicios estén listos. Comprobar la ruta pública del frontend y, si el backend tiene health endpoint configurado, consultarlo desde la red interna. Luego ejecutar la prueba de humo obligatoria:

```bash
curl --fail --silent --show-error \
  "${FRONTEND_ORIGIN}/api/metrics" |
  python -c 'import json,sys; data=json.load(sys.stdin); required={"create_date","amount","operation_type","category","business_type"}; assert isinstance(data,list) and data, "se esperaba una lista no vacía"; assert required <= data[0].keys(), f"faltan campos: {required-data[0].keys()}"; print(f"OK: {len(data)} movimientos; contrato válido")'
```

`/api/metrics` responde una lista de movimientos. La prueba debe fallar ante errores HTTP, JSON inválido, lista vacía o ausencia de campos requeridos. No aceptar como éxito únicamente que el contenedor esté en ejecución.

Validar CORS de forma adicional:

- En `direct-api`, enviar una petición con `Origin: ${FRONTEND_ORIGIN}` a `${API_ORIGIN}/api/metrics` y comprobar que la respuesta autoriza exactamente ese origen.
- En ambos modos, enviar una petición con un origen de prueba no autorizado y comprobar que la respuesta no contiene `Access-Control-Allow-Origin` para ese origen.
- No incluir un origen falso de producción como si fuera una configuración real; usar un origen de prueba claramente no autorizado.

## Criterios de aceptación

- Las dos imágenes se construyeron con tags explícitos; la del backend usa un arranque de producción sin `debugpy` ni `--reload`.
- El navegador llega al API por el modo seleccionado y el DNS del backend resuelve desde la red del frontend si se usa proxy.
- CORS no permite `*` en producción; el origen previsto funciona donde corresponda y un origen no autorizado no queda permitido.
- `GET ${FRONTEND_ORIGIN}/api/metrics` devuelve HTTP exitoso, JSON válido, una lista no vacía y los campos esperados.
- El frontend sirve contenido y la ruta `/api/metrics` funciona a través de la misma URL pública configurada.
- El resumen identifica los datos como simulados y declara cualquier paso no ejecutado o bloqueo; no afirma que haya despliegue exitoso sin evidencia de la prueba de humo.