export interface DeploymentConsumption {
  deployment_id: string
  agent_name: string
  template_type: string
  call_count: number
  total_seconds: number
  total_minutes: number
  billed_call_cost: number
  sms_count: number
  sms_cost: number
  cost_per_min: number | null
  cost_per_sms: number | null
}

export interface ConsumptionMetrics {
  period: { start: string; end: string }
  by_deployment: DeploymentConsumption[]
}

export interface ConsumptionFilters {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/** Billing constants (display-side) */
export const BILLING = {
  MONTHLY_BASE_PER_AGENT: 300, // EUR
  INCLUDED_MINUTES: 100, // per agent
  OVERAGE_RATE: 0.27, // EUR/min
  SMS_RATE: 0.14, // EUR/SMS fallback
} as const
