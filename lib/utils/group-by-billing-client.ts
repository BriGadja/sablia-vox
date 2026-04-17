import type { DeploymentConsumption } from '@/lib/types/consumption'

export interface BillingGroup {
  groupName: string
  isInternal: boolean
  deployments: DeploymentConsumption[]
  totals: {
    callCount: number
    totalMinutes: number
    smsCount: number
    billedCallCost: number
    smsCost: number
  }
}

export function groupByBillingClient(deployments: DeploymentConsumption[]): BillingGroup[] {
  const map = new Map<string, BillingGroup>()

  for (const d of deployments) {
    const groupName = d.billing_client_name ?? d.org_name
    const existing = map.get(groupName)
    if (existing) {
      existing.deployments.push(d)
      existing.totals.callCount += d.call_count
      existing.totals.totalMinutes += d.total_minutes
      existing.totals.smsCount += d.sms_count
      existing.totals.billedCallCost += d.billed_call_cost
      existing.totals.smsCost += d.sms_cost
      existing.isInternal = existing.isInternal || d.is_internal
    } else {
      map.set(groupName, {
        groupName,
        isInternal: d.is_internal,
        deployments: [d],
        totals: {
          callCount: d.call_count,
          totalMinutes: d.total_minutes,
          smsCount: d.sms_count,
          billedCallCost: d.billed_call_cost,
          smsCost: d.sms_cost,
        },
      })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      b.totals.billedCallCost + b.totals.smsCost - (a.totals.billedCallCost + a.totals.smsCost),
  )
}
