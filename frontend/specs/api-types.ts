import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types"

/** Facetas disponibles para construir filtros de métricas. */
export interface FacetsResponse {
  /** Tipos de operación disponibles: income y outcome. */
  operation_types: OperationType[]
  /** Segmentos de negocio disponibles: B2B y B2C. */
  business_types: BusinessType[]
  /** Categorías disponibles: suppliers, sales, operational, administrative y others. */
  categories: Category[]
  /** Fecha más antigua disponible, serializada como YYYY-MM-DD. */
  min_date: string
  /** Fecha más reciente disponible, serializada como YYYY-MM-DD. */
  max_date: string
}

/** Fila de alerta para un periodo cuyo gasto supera el umbral configurado. */
export interface AlertEntry {
  /** Periodo agregado; formato YYYY-MM-DD, YYYY-Www o YYYY-MM según group_by. */
  period: string
  /** Gasto total (outcome) del periodo, en unidades monetarias. */
  outcome_total: number
  /** Promedio de gasto de los periodos anteriores considerados, en unidades monetarias. */
  baseline_average: number
  /** Aumento relativo respecto al promedio, como decimal; 0.3 equivale a 30 %. */
  increase_ratio: number
}

/** Lista de alertas; puede estar vacía si ningún periodo supera el umbral. */
export type AlertsResponse = AlertEntry[]

/** Fila agregada de una categoría principal para un tipo de operación. */
export interface CategoryEntry {
  /** Categoría de la operación: suppliers, sales, operational, administrative u others. */
  category: Category
  /** Tipo de operación agregado: income o outcome. */
  operation_type: OperationType
  /** Importe agregado de la categoría, en unidades monetarias. */
  total_amount: number
}

/** Lista ordenada de categorías principales devuelta por una consulta. */
export type TopCategoriesResponse = CategoryEntry[]