import { createClient } from '@/lib/supabase/client'
import type { AccessibleAgent } from '@/lib/types/dashboard'
import type { AgentHierarchy } from '@/lib/types/navigation'

/**
 * Fetch agent hierarchy grouped by template type
 * Replaces v1's get_company_agent_hierarchy RPC
 * Queries v_user_accessible_agents view, groups client-side by template_type
 */
export async function fetchAgentHierarchy(): Promise<AgentHierarchy> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_user_accessible_agents')
    .select('*')
    .order('template_type')
    .order('deployment_name')

  if (error) {
    console.error('Error fetching agent hierarchy:', error)
    throw new Error(`Failed to fetch hierarchy: ${error.message}`)
  }

  const agents = (data || []) as AccessibleAgent[]

  // Group by template_type
  const groupMap = new Map<string, { display_name: string; agents: AgentHierarchy[0]['agents'] }>()

  for (const agent of agents) {
    const key = agent.template_type
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        display_name: agent.template_display_name,
        agents: [],
      })
    }
    groupMap.get(key)!.agents.push({
      deployment_id: agent.deployment_id,
      deployment_name: agent.deployment_name,
      slug: agent.slug,
      template_type: agent.template_type,
      template_display_name: agent.template_display_name,
      status: agent.deployment_status,
      last_call_at: agent.last_call_at,
    })
  }

  return Array.from(groupMap.entries()).map(([template_type, group]) => ({
    template_type,
    template_display_name: group.display_name,
    agents: group.agents,
  }))
}
