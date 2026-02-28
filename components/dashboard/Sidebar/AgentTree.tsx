'use client'

import { Bot, Building2, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useAgentHierarchy } from '@/lib/hooks/useAgentHierarchy'
import type { HierarchyAgent, HierarchyCompany } from '@/lib/types/navigation'

const STORAGE_KEY = 'sablia-sidebar-expanded-clients'

interface AgentTreeProps {
  viewAsUserId?: string | null
}

export function AgentTree({ viewAsUserId }: AgentTreeProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Pass viewAsUserId to the hook to filter hierarchy for "view as user" mode
  const { data: hierarchy, isLoading, error } = useAgentHierarchy(viewAsUserId)

  // State for expanded companies
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  // Load expanded state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setExpandedClients(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save expanded state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedClients]))
    } catch {
      // Ignore localStorage errors
    }
  }, [expandedClients])

  // Helper to build href with preserved viewAsUser param
  const buildHref = (baseHref: string) => {
    if (!viewAsUserId) return baseHref
    const separator = baseHref.includes('?') ? '&' : '?'
    return `${baseHref}${separator}viewAsUser=${viewAsUserId}`
  }

  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  // Check if an agent is currently active
  const isAgentActive = (deploymentId: string) => {
    return pathname === `/dashboard/agent/${deploymentId}`
  }

  // Check if any agent in a company is active
  const hasActiveAgent = (company: HierarchyCompany) => {
    return company.agents.some((agent) => isAgentActive(agent.deployment_id))
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/50 uppercase text-xs tracking-wider">
          Mes Agents
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-white/50" />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (error) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/50 uppercase text-xs tracking-wider">
          Mes Agents
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-2 text-xs text-red-400">Erreur de chargement</div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (!hierarchy || hierarchy.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/50 uppercase text-xs tracking-wider">
          Mes Agents
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-2 text-xs text-white/40">Aucun agent disponible</div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-white/50 uppercase text-xs tracking-wider">
        Mes Agents
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {hierarchy.map((company) => (
            <CompanyNode
              key={company.client_id}
              company={company}
              isExpanded={expandedClients.has(company.client_id)}
              onToggle={() => toggleClient(company.client_id)}
              buildHref={buildHref}
              isAgentActive={isAgentActive}
              hasActiveAgent={hasActiveAgent(company)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

interface CompanyNodeProps {
  company: HierarchyCompany
  isExpanded: boolean
  onToggle: () => void
  buildHref: (href: string) => string
  isAgentActive: (deploymentId: string) => boolean
  hasActiveAgent: boolean
}

function CompanyNode({
  company,
  isExpanded,
  onToggle,
  buildHref,
  isAgentActive,
  hasActiveAgent,
}: CompanyNodeProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={company.client_name}
            className={`text-white/70 hover:text-white hover:bg-white/10 ${
              hasActiveAgent ? 'text-white' : ''
            }`}
          >
            <Building2 className="size-4" />
            <span className="truncate">{company.client_name}</span>
            <ChevronRight
              className={`ml-auto size-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {company.agents.map((agent) => (
              <AgentNode
                key={agent.deployment_id}
                agent={agent}
                buildHref={buildHref}
                isActive={isAgentActive(agent.deployment_id)}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

interface AgentNodeProps {
  agent: HierarchyAgent
  buildHref: (href: string) => string
  isActive: boolean
}

function AgentNode({ agent, buildHref, isActive }: AgentNodeProps) {
  const href = buildHref(`/dashboard/agent/${agent.deployment_id}`)

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isActive}
        className="text-white/60 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
      >
        <Link href={href}>
          <Bot className="size-3" />
          <span className="truncate">{agent.deployment_name}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
