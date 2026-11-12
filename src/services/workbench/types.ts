export type Period = 'today' | 'week' | 'month';
export interface CustomerMetrics { amt: number, delta: number, orders: number, rate: number }
export interface CustomerSales extends CustomerMetrics {
  customer: { id: string, name: string, cat: string, spark: number[] }
}
export interface SalesDashboard {
  sales: number
  orders: number
  rate: number
  deltas: { dir: string, text: string }[]
  trendLabels: string[]
  trend: number[]
  trendSub: string
  cats: number[]
  catAmts: number[]
  rank: CustomerSales[]
}
export interface GoalItem { name: string, pct: number, done: number, target: number, color?: string }
export interface Goals {
  rate: number
  target: number
  done: number
  remaining: number
  days: number
  dailyRequired: number
  forecastRate: number
  daily: number
  forecast: number
  teams: GoalItem[]
  categories: GoalItem[]
}
export interface WorkbenchRepository {
  getSales: (period: Period) => Promise<SalesDashboard>
  getGoals: () => Promise<Goals>
}
