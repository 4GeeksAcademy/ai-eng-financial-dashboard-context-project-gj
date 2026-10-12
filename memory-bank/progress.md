# Progreso de skills y verificaciones

## Skills aplicadas

### Accessibility

**Justificación:** el dashboard presenta cifras, gráficas, periodos y moneda; errores de legibilidad o interpretación pueden hacer que las métricas sean difíciles de percibir o confusas. Se incorporó la skill para revisar la interfaz con criterios de accesibilidad y orientar cambios concretos.

**Cambios registrados:** el commit `80647a9` modifica `App.tsx`, componentes del dashboard, estilos, utilidades financieras y la configuración de Vite. La nota de [verification.md](../verification.md) registra cuatro hallazgos sobre presentación de datos, fechas/zonas horarias y moneda, y la aceptación de los cambios correspondientes.

### javascript-testing-patterns

**Justificación:** los KPIs, márgenes y agrupaciones mensuales son cálculos financieros con casos límite importantes. Las pruebas unitarias de funciones puras detectan regresiones rápidamente sin requerir API ni navegador; por eso se incorporó esta skill comunitaria y se siguió el stack existente Vitest en lugar de añadir otro framework.

**Cambios y resultado registrados:** se ampliaron las pruebas de `frontend/src/lib/financial-utils.test.ts` para cubrir pérdidas, ausencia de ingresos, fechas de inicio de mes, periodos que cruzan años y periodos vacíos. La ejecución documentada de `npm run test:coverage` terminó con **10 tests aprobados** y cobertura del 100% en statements, branches, functions y lines de `financial-utils.ts`. También se registró `npm run lint` aprobado. Esta cobertura no representa el frontend completo.

### vercel-react-best-practices (rendimiento)

**Justificación:** la pantalla React contiene gráficos y renderiza datos financieros; las pautas de rendimiento ayudan a evitar trabajo de renderizado y dependencias innecesarias, y a orientar el build de producción sin introducir optimizaciones prematuras.

**Cambios registrados:** la skill se incorporó como pauta comunitaria. El commit `a42fa86` actualiza componentes de gráficos/KPI y la configuración de build y despliegue del frontend: target Nginx de producción, proxy `/api/`, configuración Vite y documentación. No hay una medición de rendimiento o benchmark registrado, así que estos cambios no deben describirse como una mejora cuantificada de velocidad.

## Skill interna de despliegue

### deploy-financial-dashboard

**Justificación:** las skills comunitarias disponibles no cubrían el flujo combinado propio del repositorio: construir ambas imágenes, conectar frontend y backend por red/proxy, limitar CORS y validar `/api/metrics`. La skill interna se creó para convertir ese flujo en una guía repetible y bloquear configuraciones de desarrollo tratadas como producción.

**Alcance:** construir imágenes Docker separadas, elegir entre proxy Nginx y API pública, configurar red y CORS, y validar la respuesta JSON de `GET /api/metrics`. La guía canónica está en `.skills/deploy-financial-dashboard/SKILL.md`; `.agents/skills/deploy-financial-dashboard/SKILL.md` es su referencia para descubrimiento en el workspace.

**Resultado del preflight:** la skill identificó que `backend/Dockerfile` arranca `debugpy` y Uvicorn con `--reload`, que `backend/app/main.py` permite todos los orígenes CORS y que no había contenedores activos. Se detuvo antes de construir imágenes o afirmar que el despliegue estaba verificado. Los tests de rutas ejecutados con `cd backend && python -m pytest -q tests/test_routes.py` dieron **15 passed** y una advertencia de deprecación de `starlette.testclient` relacionada con `httpx`.

## Verificaciones pendientes

- Definir un arranque/target de backend apto para producción, sin `debugpy` ni `--reload`.
- Restringir CORS a los orígenes necesarios y probar un origen permitido y otro rechazado.
- Construir las dos imágenes y comprobar la resolución de red/upstream.
- Ejecutar la prueba de humo HTTP contra un despliegue activo; no se ha realizado todavía.

La skill `audit-website` está disponible en el repositorio, pero no hay en esta memoria un resultado de ejecución que permita marcarla como aplicada.