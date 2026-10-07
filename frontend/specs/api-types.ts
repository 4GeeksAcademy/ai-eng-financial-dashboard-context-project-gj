import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types"

export interface FacetsResponse {
  operation_types: OperationType[]
  business_types: BusinessType[]
  categories: Category[]
  min_date: string
  max_date: string
}

export interface AlertEntry {
  period: string
  outcome_total: number
  baseline_average: number
  increase_ratio: number
}

export type AlertsResponse = AlertEntry[]

export interface CategoryEntry {
  category: Category
  operation_type: OperationType
  total_amount: number
}

export type TopCategoriesResponse = CategoryEntry[]