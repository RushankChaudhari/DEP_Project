export type MonthlyRevenuePoint = {
  month: string
  revenue: number
}

export type ForecastPoint = {
  month: string
  predicted_revenue: number
}

export type CategoryShare = {
  category: string
  revenue: number
  share_percent: number
}

export type KPISet = {
  total_revenue: number
  avg_monthly_revenue: number
  aov: number
  discount_uplift_percent: number
  loyal_customer_percent: number
  category_share: CategoryShare[]
  monthly_revenue: MonthlyRevenuePoint[]
}

export type SegmentRecord = {
  cluster: number
  customer_id: string
  frequency: number
  monetary: number
  recency: number
}

export type SegmentSummary = {
  cluster: number
  recency: number
  frequency: number
  monetary: number
}

export type SegmentationPayload = {
  segments: SegmentRecord[]
  summary: SegmentSummary[]
}

export type BasketRule = {
  antecedents: string[]
  consequents: string[]
  support: number
  confidence: number
  lift: number
}

export type AnomalyRecord = {
  order_id: string
  order_date: string
  revenue: number
  discount_percent: number
  units_sold: number
  anomaly_label: number
  is_anomaly: boolean
}

export type ForecastPayload = {
  history: MonthlyRevenuePoint[]
  forecast: ForecastPoint[]
  trend: string
}

export type DiscountModel = {
  slope: number
  intercept: number
  r2: number
}

export type MetaPayload = {
  records: number
  sources?: string[]
  mapping?: Record<string, string | null>
  filter_options?: {
    categories: string[]
    states: string[]
  }
}

export type GlobalResponse = {
  kpis: KPISet
  segmentation: SegmentationPayload
  basket_rules: BasketRule[]
  anomalies: AnomalyRecord[]
  forecast: ForecastPayload
  discount_model: DiscountModel
  meta: MetaPayload
}

export type AdvancedResponse = {
  segmentation: SegmentationPayload
  basket_rules: BasketRule[]
  anomalies: AnomalyRecord[]
  forecast: ForecastPayload
  discount_model: DiscountModel
}

export type LocalResponse = {
  kpis: KPISet
  segmentation: SegmentationPayload
  anomalies: AnomalyRecord[]
  forecast: ForecastPayload
  discount_model: DiscountModel
  meta: MetaPayload
}

export type CompareMetric = {
  metric: string
  global: number
  local: number
  gap: number
  gap_percent: number
}

export type CompareResponse = {
  comparison: CompareMetric[]
}

export type Suggestion = {
  priority: string
  title: string
  description: string
}

export type SuggestionsResponse = {
  suggestions: Suggestion[]
}

export type UploadResponse = {
  message: string
  local: LocalResponse
}
