import type {
  BusinessType,
  GroupBy,
  OperationType,
} from "../src/lib/financial-types"

/** Límites opcionales de fecha para filtrar movimientos y agregados. */
export interface DateRangeFilter {
  /** Fecha inicial inclusiva del filtro, en formato YYYY-MM-DD. */
  start_date?: string
  /** Fecha final inclusiva del filtro, en formato YYYY-MM-DD. */
  end_date?: string
}

/** Parámetros de consulta del endpoint de alertas. */
export interface AlertsParams extends DateRangeFilter {
  /** Aumento relativo mínimo para emitir una alerta; debe ser >= 0 y por defecto es 0.3. */
  threshold?: number
  /** Granularidad de los periodos: day, week o month; por defecto es month. */
  group_by?: GroupBy
  /** Segmento opcional; omitido, incluye todos los segmentos. */
  business_type?: BusinessType
}

/** Parámetros de consulta del endpoint de categorías principales. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Tipo de movimiento que se agrega: income o outcome; por defecto es outcome. */
  operation_type?: OperationType
  /** Número máximo de categorías, entero entre 1 y 20; por defecto es 5. */
  limit?: number
  /** Segmento consultado; requerido por cada llamada comparativa como B2B o B2C. */
  business_type?: BusinessType
}