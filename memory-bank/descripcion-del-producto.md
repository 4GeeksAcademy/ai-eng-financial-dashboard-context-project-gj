# Descripción del producto

Dashboard de métricas financieras para visualizar ingresos, gastos, beneficio y margen, además de tendencias mensuales. El frontend obtiene movimientos desde una API y calcula los indicadores y agrupaciones que presenta. El backend ofrece también endpoints de resumen, categorías principales, comparación de periodos, alertas y filtros B2B/B2C.

La aplicación está en estado de demostración: los movimientos se generan en memoria con datos simulados en `backend/app/routes.py`; no se observa persistencia en base de datos. `frontend/src/lib/mock-data.ts` tiene otro conjunto de muestra, pero no es la fuente que consume `App.tsx`.