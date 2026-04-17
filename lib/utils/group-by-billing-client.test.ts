import { describe, expect, it } from 'vitest'
import type { DeploymentConsumption } from '@/lib/types/consumption'
import { groupByBillingClient } from './group-by-billing-client'

function dep(overrides: Partial<DeploymentConsumption>): DeploymentConsumption {
  return {
    deployment_id: 'd1',
    agent_name: 'Agent',
    template_type: 'setter',
    org_id: 'org-1',
    org_name: 'Org One',
    is_internal: false,
    billing_client_name: null,
    call_count: 0,
    total_seconds: 0,
    total_minutes: 0,
    billed_call_cost: 0,
    sms_count: 0,
    sms_cost: 0,
    cost_per_min: 0.27,
    cost_per_sms: 0.14,
    ...overrides,
  }
}

describe('groupByBillingClient', () => {
  it('groups deployments sharing the same billing_client_name', () => {
    const groups = groupByBillingClient([
      dep({
        deployment_id: 'd1',
        org_name: 'Exotic Design',
        billing_client_name: 'VB',
        billed_call_cost: 10,
      }),
      dep({
        deployment_id: 'd2',
        org_name: 'Stefano Design',
        billing_client_name: 'VB',
        billed_call_cost: 5,
      }),
      dep({
        deployment_id: 'd3',
        org_name: 'Norloc',
        billing_client_name: 'Norloc',
        billed_call_cost: 20,
      }),
    ])

    expect(groups).toHaveLength(2)
    const vb = groups.find((g) => g.groupName === 'VB')
    expect(vb?.deployments).toHaveLength(2)
    expect(vb?.totals.billedCallCost).toBe(15)
  })

  it('falls back to org_name when billing_client_name is null', () => {
    const groups = groupByBillingClient([
      dep({
        deployment_id: 'd1',
        org_name: 'Sablia',
        billing_client_name: null,
        is_internal: true,
      }),
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].groupName).toBe('Sablia')
    expect(groups[0].isInternal).toBe(true)
  })

  it('sums call_count, total_minutes, sms across deployments in a group', () => {
    const groups = groupByBillingClient([
      dep({
        deployment_id: 'd1',
        billing_client_name: 'VB',
        call_count: 10,
        total_minutes: 25.5,
        sms_count: 3,
        sms_cost: 0.42,
        billed_call_cost: 6.88,
      }),
      dep({
        deployment_id: 'd2',
        billing_client_name: 'VB',
        call_count: 4,
        total_minutes: 9.2,
        sms_count: 1,
        sms_cost: 0.14,
        billed_call_cost: 2.5,
      }),
    ])

    expect(groups[0].totals.callCount).toBe(14)
    expect(groups[0].totals.smsCount).toBe(4)
    expect(groups[0].totals.totalMinutes).toBeCloseTo(34.7, 2)
    expect(groups[0].totals.billedCallCost).toBeCloseTo(9.38, 2)
    expect(groups[0].totals.smsCost).toBeCloseTo(0.56, 2)
  })

  it('sorts groups by total cost descending (call + sms)', () => {
    const groups = groupByBillingClient([
      dep({
        deployment_id: 'd1',
        billing_client_name: 'Small',
        billed_call_cost: 1,
        sms_cost: 0.5,
      }),
      dep({
        deployment_id: 'd2',
        billing_client_name: 'Big',
        billed_call_cost: 50,
        sms_cost: 5,
      }),
      dep({
        deployment_id: 'd3',
        billing_client_name: 'Mid',
        billed_call_cost: 10,
        sms_cost: 2,
      }),
    ])

    expect(groups.map((g) => g.groupName)).toEqual(['Big', 'Mid', 'Small'])
  })
})
