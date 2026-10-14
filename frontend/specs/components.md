# Componentes por funcionalidad

Este documento describe la composicion actual del dashboard y los componentes previstos para las funcionalidades analiticas. Las funcionalidades de filtros, alertas y comparacion de categorias todavia no estan conectadas a la pantalla.

## Estado actual

`App` actua como contenedor: solicita `GET /api/metrics`, calcula KPIs y series mensuales en el cliente, y presenta `DashboardHeader`, `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`. Los componentes de grafico usan `Card` y `Skeleton` para los estados de carga y contemplan la ausencia de datos.

La implementacion actual no obtiene facets, no filtra por fechas ni muestra alertas o una tabla de categorias B2B vs B2C. El periodo del encabezado tambien esta fijado a `2024 - Full Year`; al conectar el filtro debe derivarse del rango seleccionado, no de una constante.

## Componentes compartidos

### `DashboardHeader` (existente)

- Muestra el nombre del dashboard y el periodo activo.
- Debe recibir el periodo derivado del rango seleccionado cuando se implemente el filtro.
- No solicita datos ni aplica filtros.

### `DateRangeFilter` (propuesto)

- Presenta controles para fecha inicial y final.
- Obtiene `min_date` y `max_date` desde `GET /api/metrics/facets` para acotar las fechas seleccionables. Facets informa limites y opciones; no aplica el filtro.
- Emite fechas como `YYYY-MM-DD`. Cada fecha es opcional y, cuando se envia, el backend trata ambos extremos como inclusivos.
- El contenedor de la pagina conserva el rango y lo envia como `start_date` y `end_date` a cada consulta compatible.
- Debe impedir o comunicar un rango invalido en el que la fecha inicial sea posterior a la final.
- Decision de producto: el estado inicial tiene ambas fechas omitidas, lo que representa todos los datos disponibles. `min_date` y `max_date` limitan el calendario; no se convierten automaticamente en filtros. El encabezado presenta ese estado como "Todo el periodo disponible".

Props:

```ts
interface DateRangeFilterProps {
	facets: FacetsResponse | null
	value: DateRangeFilter
	onChange: (value: DateRangeFilter) => void
	disabled?: boolean
}
```

Los tipos de rango existentes estan en `param-types.ts`; el contrato de respuestas esta en `api-types.ts`.

## 1. Filtro por rango de fechas

**Composicion:** `DashboardPage` (`App`, existente) coordina el nuevo `DateRangeFilter` con los widgets que dependan del periodo.

**Flujo de datos:** consultar facets una vez para obtener los limites disponibles; al cambiar el rango, volver a solicitar los datos del widget correspondiente pasando las fechas por query. Las rutas analiticas disponibles incluyen `/api/metrics`, `/api/metrics/summary`, `/api/metrics/categories/top` y `/api/metrics/alerts`. El endpoint `/api/metrics/facets` no recibe ni aplica el rango.

Los filtros de categoria, tipo de operacion o segmento solo se deben enviar a rutas que los admitan. La API no define un unico objeto de filtro compartido en el servidor; `DateRangeFilter` es una composicion de parametros del cliente.

Al serializar la consulta, omitir las fechas no seleccionadas en vez de enviar `undefined` como texto.

## 2. Tabla de alertas

### `AlertsTable` (propuesto)

- Consume `AlertsResponse` y presenta una fila por periodo devuelto por `GET /api/metrics/alerts`.
- Columnas: periodo (`period`), gasto del periodo (`outcome_total`), promedio historico (`baseline_average`) y aumento relativo (`increase_ratio`).
- Formatea `increase_ratio` como porcentaje multiplicando el decimal por 100; por ejemplo, `0.3` se muestra como `30 %`.
- No muestra severidad, categoria, causa ni recomendacion: esos campos no existen en la respuesta.
- Contempla carga, error y respuesta vacia. Puede reutilizar `Card` y `Skeleton` sin anidar una tarjeta dentro de otra.
- Decision de producto: consultar por defecto por mes con `threshold=0.3` (30 %) y sin `business_type`, es decir, todos los segmentos agregados. No se muestran selectores de granularidad, segmento o umbral en esta iteracion.

Props:

```ts
interface AlertsTableProps {
	rows: AlertsResponse
	loading: boolean
	error: string | null
}
```

**Consulta:** `GET /api/metrics/alerts`. Admite `threshold` (por defecto `0.3`, minimo `0`), `group_by` (`day`, `week` o `month`; por defecto `month`), fechas opcionales y `business_type` opcional (`B2B` o `B2C`). `period` depende de `group_by`: fecha `YYYY-MM-DD`, semana ISO `YYYY-Www` o mes `YYYY-MM`.

`AlertsParams` describe el query completo, incluyendo `group_by` y `business_type`; el contenedor aplica los defaults de producto anteriores.

## 3. Comparacion de categorias B2B vs B2C

### `TopCategoriesComparison` (propuesto)

- Solicita `GET /api/metrics/categories/top` una vez con `business_type=B2B` y otra con `business_type=B2C`.
- Mantiene iguales el rango, `operation_type` y `limit` en ambas consultas para que la comparacion use los mismos criterios.
- Combina las filas por `category` en el cliente y muestra los importes de ambos segmentos en columnas comparables.
- Ordena las filas en el orden estable de `Category` (`suppliers`, `sales`, `operational`, `administrative`, `others`), no por un total combinado que la API no calcula.
- La API responde listas independientes; no devuelve un campo `business_type` en cada fila ni una comparacion conjunta.
- Si una categoria no aparece en la lista limitada de un segmento, mostrar "No incluida en top N", no cero: puede haber quedado fuera del limite de filas.
- Contempla carga, error y ausencia de resultados para cada segmento.
- Decision de producto: comparar gastos (`operation_type=outcome`) y mostrar las cinco categorias principales por segmento (`limit=5`). Las dos consultas comparten rango y filtros, y la tabla solo se considera lista cuando ambas solicitudes terminan correctamente.

Props:

```ts
interface TopCategoriesComparisonProps {
	b2b: TopCategoriesResponse
	b2c: TopCategoriesResponse
	loading: boolean
	error: string | null
}
```

**Consulta:** `operation_type` acepta `income` o `outcome` (por defecto `outcome`); `limit` es un entero de `1` a `20` (por defecto `5`); las fechas son opcionales. `business_type` acepta un solo valor por solicitud. `TopCategoriesParams` incluye ese campo; el contenedor realiza una llamada por segmento y guarda cada respuesta en el prop correspondiente.

## Convenciones de implementacion

- Los nuevos componentes visuales deben seguir el patron de archivos kebab-case usado en `src/components/dashboard/`.
- El contenedor coordina consultas y filtros; las tablas reciben datos tipados y estados de presentacion, sin duplicar agregaciones que ya realiza la API.
- Reutilizar `Card` y `Skeleton` para mantener la presentacion coherente y cubrir los estados de carga y vacio.
- Mantener alineados los tipos TypeScript con los modelos y parametros de FastAPI. La referencia funcional del contrato esta en `dashboard-api-alignment.md`.