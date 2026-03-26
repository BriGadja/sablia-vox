'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccessibleAgents } from '@/lib/hooks/useDashboardData'
import { deduplicateBy } from '@/lib/utils'

interface AgentFilterProps {
  selectedAgentIds: string[]
  onChange: (agentIds: string[]) => void
  templateType?: string
}

export function AgentFilter({
  selectedAgentIds,
  onChange,
  templateType,
}: AgentFilterProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: allAgentsRaw, isLoading: isLoadingAgents } = useAccessibleAgents(
    templateType || undefined,
  )

  const agents = deduplicateBy(allAgentsRaw, (a) => a.deployment_id)

  useEffect(() => {
    if (agents) {
      const validAgentIds = agents.map((a) => a.deployment_id)
      const newAgentIds = selectedAgentIds.filter((id) => validAgentIds.includes(id))
      if (newAgentIds.length !== selectedAgentIds.length) {
        onChange(newAgentIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents])

  const handleAgentChange = (agentId: string) => {
    if (agentId === 'all') {
      onChange([])
    } else {
      onChange([agentId])
    }
  }

  const showAgentsLoading = !isMounted || isLoadingAgents || !agents || agents.length === 0

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="w-full sm:w-64">
        <label className="block text-xs font-medium text-white/80 mb-1.5">Agent</label>
        <div className="relative">
          <select
            value={selectedAgentIds[0] || 'all'}
            onChange={(e) => handleAgentChange(e.target.value)}
            disabled={showAgentsLoading}
            className="w-full px-2 py-1.5 text-sm border border-white/20 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer disabled:opacity-50 [&>option]:bg-black [&>option]:text-white"
          >
            <option value="all">Tous les agents</option>
            {isMounted &&
              agents?.map((agent) => (
                <option key={agent.deployment_id} value={agent.deployment_id}>
                  {agent.deployment_name}
                </option>
              ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
