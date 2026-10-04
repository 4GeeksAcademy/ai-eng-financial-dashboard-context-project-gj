# Reglas propuestas para el dashboard financiero

Estas reglas se basan en patrones y contratos que ya existen en el repositorio. Al cambiar una convención, actualizar también la evidencia y las pruebas afectadas.

## 1. Mantener alineado el contrato de movimientos

- **Hecho del repo:** `backend/app/routes.py` define `FinancialMovement` y los valores permitidos con tipos `Literal`; `frontend/src/lib/financial-types.ts` define las uniones equivalentes y la interfaz que consume React.
- **Regla propuesta:** al modificar campos, categorías, tipos de operación o negocio, actualizar los modelos del backend y los tipos del frontend en el mismo cambio. Añadir o ajustar pruebas para validar el contrato.
- **Riesgo que evita:** que el API acepte o devuelva valores que TypeScript no contempla, o que el frontend dependa de campos ausentes.

## 2. Respetar el flujo actual de datos

- **Hecho del repo:** `frontend/src/App.tsx` solicita `GET /api/metrics`; luego `frontend/src/lib/financial-utils.ts` calcula KPIs y agrupaciones mensuales en el cliente. Las otras rutas analíticas de `backend/app/routes.py` no se consumen desde esa pantalla.
- **Regla propuesta:** antes de ampliar el dashboard, comprobar si el dato debe venir de una ruta existente o de un cálculo del cliente. No duplicar cálculos entre backend y frontend ni asumir que una ruta ya está integrada.
- **Riesgo que evita:** lógica duplicada, resultados discrepantes y endpoints añadidos que la interfaz nunca utiliza.

## 3. Distinguir datos simulados de datos persistentes

- **Hecho del repo:** `backend/app/routes.py` genera movimientos con `generate_mock_movements(seed=42)` y no consulta una base de datos. `frontend/src/lib/mock-data.ts` contiene otro conjunto de ejemplo, pero no está importado por `App.tsx`.
- **Regla propuesta:** tratar el generador del backend como fuente actual de los datos que ve la pantalla. No presentar los datos como reales ni editar `mock-data.ts` esperando cambiar esa pantalla; si cambia la fuente, actualizar el flujo y las pruebas explícitamente.
- **Riesgo que evita:** modificaciones sin efecto y afirmaciones financieras que confundan datos de demostración con información persistida.

## 4. Mantener coherente el periodo mostrado

- **Hecho del repo:** `backend/app/routes.py` asigna fechas en función de `date.today()`, mientras `frontend/src/App.tsx` fija el encabezado a `2024 - Full Year`.
- **Regla propuesta:** no asumir que los movimientos corresponden a 2024. Si se modifica el rango o la generación de fechas, actualizar también el periodo de la interfaz para derivarlo de los datos o de un filtro real.
- **Riesgo que evita:** mostrar cifras de un periodo bajo una etiqueta que no corresponde.

## 5. Cambiar juntos la red de desarrollo y sus puertos

- **Hecho del repo:** `docker-compose.yml` publica los puertos de los servicios; `frontend/vite.config.ts` reenvía `/api` a `http://backend:8000`, nombre DNS interno de Compose. Los Dockerfiles también declaran los puertos de escucha.
- **Regla propuesta:** al cambiar puertos, proxy o servicios, revisar en conjunto Compose, Vite y los Dockerfiles. Distinguir puertos internos del contenedor de los publicados en el host; no codificar `localhost` como destino del proxy entre contenedores.
- **Riesgo que evita:** frontend sin conexión al API y documentación que promete un puerto host disponible cuando no se ha comprobado.

## 6. Reutilizar los componentes y estados de interfaz existentes

- **Hecho del repo:** las vistas del dashboard reutilizan `Card` y `Skeleton` de `frontend/src/components/ui/`; los gráficos usan Recharts y contemplan carga y ausencia de datos.
- **Regla propuesta:** construir nuevas secciones siguiendo esos componentes y conservar estados de carga, error y datos vacíos cuando se añada una fuente o una vista nueva.
- **Riesgo que evita:** patrones visuales incompatibles y pantallas que parecen rotas durante carga o cuando una consulta no devuelve datos.

## 7. Probar los cambios en la capa correspondiente

- **Hecho del repo:** `backend/tests/test_routes.py` usa `TestClient` para probar rutas y filtros; `frontend/src/lib/financial-utils.test.ts` usa Vitest para probar cálculos y formatos. `frontend/package.json` define `npm test`.
- **Regla propuesta:** agregar o actualizar pruebas de backend al cambiar rutas, filtros o agregaciones; actualizar pruebas de Vitest al cambiar utilidades financieras. Ejecutar las pruebas correspondientes antes de cerrar el cambio.
- **Riesgo que evita:** regresiones en contratos, fechas, totales o formatos que una comprobación visual aislada no detecta.

## 8. No ampliar CORS sin definir el entorno

- **Hecho del repo:** `backend/app/main.py` configura CORS con todos los orígenes, métodos y encabezados permitidos, además de credenciales.
- **Regla propuesta:** tratar esa configuración como conveniencia de desarrollo. Antes de desplegar o endurecer el API, definir orígenes permitidos explícitamente y comprobar la política de credenciales; no copiar la configuración abierta como recomendación de producción.
- **Riesgo que evita:** permitir desde orígenes no previstos solicitudes con credenciales en un entorno desplegado.

## 9. Preservar el estilo local al editar

- **Hecho del repo:** los componentes reutilizables de `frontend/src/components/dashboard/` y `frontend/src/components/ui/` usan archivos kebab-case y exportan nombres PascalCase; `App.tsx` es una excepción de entrada. El estilo de punto y coma varía entre archivos TypeScript existentes.
- **Regla propuesta:** conservar el nombre y formato del archivo circundante y limitar el formateo al código modificado. No hacer reformateos masivos para imponer una convención que el repositorio todavía no aplica uniformemente.
- **Riesgo que evita:** diffs ruidosos que ocultan cambios funcionales y conflictos innecesarios en revisiones.