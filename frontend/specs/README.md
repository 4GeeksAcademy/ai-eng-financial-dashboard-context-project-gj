# Contrato API del dashboard

Esta guia relaciona las tres funcionalidades con sus endpoints, tipos TypeScript, restricciones y comportamiento esperado de la UI.

## Estado de verificacion de rutas

Las rutas y parametros se verificaron contra el OpenAPI generado en vivo por el backend local (`/openapi.json`, el esquema que presenta `/docs`). Se confirmaron `GET /api/metrics/facets`, `GET /api/metrics`, `GET /api/metrics/alerts` y `GET /api/metrics/categories/top`, junto con sus parametros, enums, formatos, defaults y limites. Esta verificacion confirma el backend local de este workspace; no implica que una instancia desplegada tenga la misma version.

Los tipos referenciados estan en `api-types.ts`, `param-types.ts` y `../src/lib/financial-types.ts`.

## 1. Filtro por rango de fechas

### Endpoints y tipos

| Metodo y ruta | Query TypeScript | Respuesta TypeScript | Uso |
| --- | --- | --- | --- |
| `GET /api/metrics/facets` | Ninguno | `FacetsResponse` | Da `min_date` y `max_date` para acotar el selector; tambien devuelve los valores disponibles de operacion, segmento y categoria. |
| `GET /api/metrics` | `DateRangeFilter` (subconjunto de sus query params) | `FinancialMovement[]` | Devuelve movimientos filtrados que alimentan los indicadores y graficos actuales. |

`DateRangeFilter` solo tipa las fechas usadas por esta funcionalidad. `/api/metrics` tambien admite `category` y `operation_type`, pero no forman parte del filtro de rango documentado aqui. `/api/metrics/facets` no acepta fechas ni filtra resultados.

### Parametros y restricciones

| Parametro | Tipo | Requerido | Valores y restricciones |
| --- | --- | --- | --- |
| `start_date` | `string` | No | Fecha `YYYY-MM-DD`; inclusiva. El API acepta cualquier fecha valida, incluso fuera de facets. La UI limita el calendario a `min_date`..`max_date`. |
| `end_date` | `string` | No | Fecha `YYYY-MM-DD`; inclusiva. Mismas restricciones que `start_date`. |

Cada extremo se puede enviar por separado. Omitir ambos significa todos los movimientos disponibles. FastAPI valida que las fechas sean fechas; el orden inicio/fin no se valida en el endpoint de movimientos. La UI debe impedir `start_date > end_date` y omitir claves no seleccionadas al crear el query string.

### Casos limite y UI

| Caso | Comportamiento esperado de la UI |
| --- | --- |
| Ambas fechas omitidas | Mostrar "Todo el periodo disponible" y consultar sin `start_date` ni `end_date`; no sustituirlas silenciosamente por las fechas de facets. |
| Solo una fecha definida | Tratarla como limite abierto e inclusivo; conservar el otro extremo vacio. |
| Fecha inicial posterior a la final | Marcar el rango como invalido, explicar el error junto al control y no enviar la consulta. El endpoint no garantiza esa validacion y el filtro puede devolver una lista vacia. |
| Rango valido sin movimientos (por ejemplo, fechas fuera del conjunto disponible) | Mostrar estado vacio de datos, no un error de red; mantener los controles para cambiar el rango. |

## 2. Tabla de alertas de anomalias

### Endpoint y tipos

| Metodo y ruta | Query TypeScript | Respuesta TypeScript |
| --- | --- | --- |
| `GET /api/metrics/alerts` | `AlertsParams` (incluye `DateRangeFilter`) | `AlertsResponse` (`AlertEntry[]`) |

### Parametros y restricciones

| Parametro | Tipo | Requerido | Valores y restricciones |
| --- | --- | --- | --- |
| `threshold` | `number` | No | Decimal >= 0; default `0.3`; no hay maximo documentado. Se emite alerta solo si el aumento relativo es estrictamente mayor al umbral. |
| `group_by` | `GroupBy` | No | `day`, `week` o `month`; default `month`. |
| `start_date` | `string` | No | Fecha `YYYY-MM-DD`, inclusiva. |
| `end_date` | `string` | No | Fecha `YYYY-MM-DD`, inclusiva. |
| `business_type` | `BusinessType` | No | `B2B` o `B2C`; omitido agrega ambos segmentos. |

El response es una lista de filas `AlertEntry`: `period`, `outcome_total`, `baseline_average` e `increase_ratio`. `increase_ratio` es decimal (`0.3` = `30 %`). `period` es `YYYY-MM-DD` para `day`, `YYYY-Www` para `week` y `YYYY-MM` para `month`. No hay campos de severidad, categoria, causa o recomendacion.

### Casos limite y UI

| Caso | Comportamiento esperado de la UI |
| --- | --- |
| Respuesta `[]`, incluyendo periodos sin baseline historico o con baseline cero | Mostrar la tabla vacia con un mensaje como "No hay anomalias para este periodo"; no tratarlo como error. |
| El aumento es exactamente igual a `threshold` | No incluir alerta porque el backend usa comparacion estricta `>`; no redondear antes de decidir si una fila califica. |
| `threshold < 0`, valor de `group_by` no admitido o fecha mal formada | La API rechaza el parametro (HTTP 422); mostrar error de consulta y no presentar resultados anteriores como si correspondieran a los nuevos filtros. |
| El usuario filtra por un segmento sin alertas | Mostrar estado vacio de ese filtro, manteniendo visible el segmento seleccionado. |

Decision de UI: usar por defecto `group_by=month`, `threshold=0.3` y omitir `business_type` (ambos segmentos). Esta iteracion no expone controles para cambiar esos valores.

## 3. Comparacion de categorias B2B vs B2C

### Endpoints y tipos

La API no devuelve una comparacion conjunta. La UI hace dos peticiones al mismo endpoint y las conserva separadas:

| Metodo y ruta | Query TypeScript | Respuesta TypeScript |
| --- | --- | --- |
| `GET /api/metrics/categories/top?business_type=B2B` | `TopCategoriesParams` con `business_type: "B2B"` | `TopCategoriesResponse` (`CategoryEntry[]`) |
| `GET /api/metrics/categories/top?business_type=B2C` | `TopCategoriesParams` con `business_type: "B2C"` | `TopCategoriesResponse` (`CategoryEntry[]`) |

Las dos consultas deben compartir `start_date`, `end_date`, `operation_type` y `limit`. `CategoryEntry` no incluye `business_type`; el segmento corresponde a la peticion que produjo cada lista.

### Parametros y restricciones

| Parametro | Tipo | Requerido por API | Valores y restricciones |
| --- | --- | --- | --- |
| `business_type` | `BusinessType` | No | `B2B` o `B2C`; para esta comparacion la UI debe enviarlo explicitamente en cada peticion, una por segmento. |
| `operation_type` | `OperationType` | No | `income` o `outcome`; default `outcome`. |
| `limit` | `number` | No | Entero de `1` a `20`; default `5`. La UI pide top 5 en ambos segmentos. |
| `start_date` | `string` | No | Fecha `YYYY-MM-DD`, inclusiva. |
| `end_date` | `string` | No | Fecha `YYYY-MM-DD`, inclusiva. |

Las categorias validas son `suppliers`, `sales`, `operational`, `administrative` y `others`. Cada respuesta es una lista ordenada por `total_amount` descendente y puede tener menos filas que `limit`.

### Casos limite y UI

| Caso | Comportamiento esperado de la UI |
| --- | --- |
| Una respuesta no incluye una categoria que si aparece en la otra lista | Mostrar la categoria en la comparacion y marcar el lado ausente como "No incluida en top 5"; no afirmar que el total es cero porque la categoria pudo quedar fuera del limite. |
| Una peticion falla y la otra tiene exito | Mostrar estado de error para la comparacion completa y ofrecer reintento; no presentar una comparacion parcial como si ambos segmentos se hubieran consultado. |
| Una o ambas listas son `[]` con HTTP 200 | Mostrar estado sin categorias para la lista vacia. Si la otra tiene filas, mostrar esas categorias y marcar el lado vacio como "Sin resultados". |
| `limit` no es entero o queda fuera de `1..20`, o `business_type`/`operation_type` no es valido | La API rechaza la peticion (HTTP 422); mostrar error de consulta. No transformar silenciosamente un parametro invalido. |

Decision de UI: comparar gastos (`operation_type=outcome`) con `limit=5`. La fila final se forma en el cliente a partir de la union de categorias recibidas y se ordena con el orden fijo de `Category`; la API no calcula un total combinado ni un delta B2B menos B2C.