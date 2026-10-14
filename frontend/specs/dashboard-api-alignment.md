# Alineacion de funcionalidades del dashboard con la API

Esta especificacion traduce el wording de las tres funcionalidades solicitadas a los parametros y campos que realmente publica la API. No modifica ni amplía el contrato del backend.

## 1. Filtro por rango de fechas

**Wording del PM:** "Filtro de rango de fechas".

**Wording alineado:** filtrar movimientos y agregados por `start_date` y `end_date` en formato `YYYY-MM-DD`. Cuando se proporcionen, ambos extremos del rango son inclusivos.

**Contrato disponible:**

- `GET /api/metrics`: `start_date` y `end_date` opcionales. Responde un array de movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`.
- `GET /api/metrics/summary`: rango opcional; agrega a `period`, `income`, `outcome` y `net`.
- `GET /api/metrics/categories/top`: rango opcional; devuelve `category`, `operation_type` y `total_amount`.
- `GET /api/metrics/alerts`: rango opcional; limita los periodos usados para producir alertas.
- `GET /api/metrics/comparison`: `start_date` y `end_date` obligatorios; compara el neto del rango con el rango anterior de la misma duracion.

El contrato no define un objeto de rango ni un envoltorio comun: cada endpoint recibe los parametros por query y devuelve su propio formato. `GET /api/metrics/facets` puede aportar `min_date` y `max_date` para acotar controles, pero no aplica el filtro.

## 2. Tabla de alertas de anomalias

**Wording del PM:** "Tabla de alertas de anomalias en el dashboard principal".

**Wording alineado:** tabla de periodos cuyo gasto (`outcome`) supera el promedio de gasto de los periodos anteriores por encima de un umbral configurable. No describirla como un detector de categorias, causas o severidades: esos datos no forman parte de la respuesta.

**Endpoint:** `GET /api/metrics/alerts`.

**Query:** `threshold` (por defecto `0.3`, minimo `0`), `group_by` (`day`, `week` o `month`; por defecto `month`), `start_date`, `end_date` y `business_type` (`B2B` o `B2C`), estos tres ultimos opcionales.

**Respuesta:** array de filas con:

- `period`: periodo de la alerta.
- `outcome_total`: gasto agregado del periodo.
- `baseline_average`: promedio de gasto de los periodos anteriores considerados.
- `increase_ratio`: aumento relativo como proporcion decimal; `0.3` equivale a 30%. Para mostrar porcentaje, la interfaz debe multiplicar este valor por 100.

La API puede devolver un array vacio. No entrega `severity`, `category`, texto explicativo ni recomendacion.

## 3. Vista comparativa B2B vs B2C

**Wording del PM:** "Vista comparativa B2B vs B2C en el dashboard principal".

**Wording alineado con el contrato actual:** comparar series agregadas por segmento, solicitando por separado `business_type=B2B` y `business_type=B2C`. El campo `business_type` acepta un solo valor por solicitud; no existe una respuesta conjunta que compare ambos segmentos.

**Endpoints disponibles:**

- `GET /api/metrics/summary?group_by=month&business_type=B2B` y la misma solicitud con `business_type=B2C`: series con `period`, `income`, `outcome` y `net` para cada segmento.
- `GET /api/metrics/comparison?start_date=...&end_date=...&business_type=B2B` (y otra solicitud para B2C): compara cada segmento con su periodo anterior. Su respuesta es `current_period`, `previous_period`, `delta_abs` y `delta_pct`; no representa la diferencia B2B menos B2C.

Por tanto, una comparacion directa B2B contra B2C puede componerse en el cliente a partir de dos respuestas de `summary`. Si el requerimiento exige una unica respuesta con ambos segmentos o un delta entre ellos, eso es una necesidad de API no cubierta por el contrato actual, no una capacidad que deba atribuirse al endpoint `/comparison`.

## Estado de integracion en el dashboard

La pantalla principal actualmente solicita solo `GET /api/metrics` y calcula sus indicadores y series mensuales en el cliente. Las rutas de resumen, alertas, categorias y comparacion descritas aqui existen en el backend, pero no estan conectadas a esa pantalla.