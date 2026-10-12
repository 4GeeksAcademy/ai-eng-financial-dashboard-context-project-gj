# Estado actual

- La pantalla principal (`frontend/src/App.tsx`) solo solicita `GET /api/metrics`; los endpoints analíticos adicionales del backend no están conectados a esa vista.
- El encabezado del frontend muestra `2024 - Full Year`, pero el generador del backend crea fechas relativas al año actual y al anterior. No asumir que la etiqueta coincide con los datos.
- Los tests de frontend se ejecutaron al validar la skill `javascript-testing-patterns`: 10 tests Vitest pasan. La cobertura de `financial-utils.ts` es 100% en statements, funciones y líneas, y 100% en branches; esta cifra solo cubre el módulo instrumentado, no toda la UI.
- La última comprobación de `docker compose ps` no mostró contenedores activos del proyecto. Por tanto, el estado de ejecución/accesibilidad no está confirmado. Compose configura puertos host `5173`, `8000` y `5678`; eso no garantiza que estén disponibles en el host.
- La configuración de CORS del backend permite todos los orígenes, métodos y encabezados junto con credenciales; debe revisarse antes de un despliegue.

## Utilidad de la skill de testing JavaScript

- El dashboard calcula KPIs, márgenes y agrupaciones de meses en `frontend/src/lib/financial-utils.ts`. Errores en ingresos cero, pérdidas o periodos que cruzan años cambian cifras financieras visibles, por lo que probar estas funciones puras da feedback rápido y determinista sin necesitar API ni navegador.
- La suite existente usa Vitest, TypeScript y el patrón Arrange-Act-Assert recomendado por la skill; se amplió con casos de pérdida, mes sin ingresos y periodo de un solo mes. Ejecutar `cd frontend && npm run test:coverage` mide el alcance cubierto.
- La cobertura reportada corresponde a `financial-utils.ts`, no a componentes. Cuando cambien estados de carga/error, fetch o interacciones de React, agregar pruebas de componente o integración con dependencias mockeadas y consultas semánticas; no asumir que la cobertura de utilidades protege esos flujos.