'use client'

import { Bot, ChevronRight, Loader2, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import type { HierarchyAgent, HierarchyTemplateGroup } from '@/lib/types/navigation'

const STORAGE_KEY = 'sablia-sidebar-expanded-groups'

/**
 * Template type color mapping
 */
const templateColors: Record<string, string> = {
  setter: 'text-violet-400',
  secretary: 'text-blue-400',
  transfer: 'text-orange-400',
}

export function AgentTree() {
  const pathname = usePathname()
  const { data: hierarchy, isLoading, error } = useAgentHierarchy()

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setExpandedGroups(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expandedGroups]))
    } catch {
      // Ignore localStorage errors
    }
  }, [expandedGroups])

  const toggleGroup = (templateType: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(templateType)) {
        next.delete(templateType)
      } else {
        next.add(templateType)
      }
      return next
    })
  }

  const isAgentActive = (deploymentId: string) => {
    return pathname.startsWith(`/dashboard/agents/${deploymentId}`)
  }

  const hasActiveAgent = (group: HierarchyTemplateGroup) => {
    return group.agents.some((agent) => isAgentActive(agent.deployment_id))
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
          {hierarchy.map((group) => (
            <TemplateGroupNode
              key={group.template_type}
              group={group}
              isExpanded={expandedGroups.has(group.template_type)}
              onToggle={() => toggleGroup(group.template_type)}
              isAgentActive={isAgentActive}
              hasActiveAgent={hasActiveAgent(group)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

interface TemplateGroupNodeProps {
  group: HierarchyTemplateGroup
  isExpanded: boolean
  onToggle: () => void
  isAgentActive: (deploymentId: string) => boolean
  hasActiveAgent: boolean
}

function TemplateGroupNode({
  group,
  isExpanded,
  onToggle,
  isAgentActive,
  hasActiveAgent,
}: TemplateGroupNodeProps) {
  const colorClass = templateColors[group.template_type] || 'text-white/60'

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={group.template_display_name}
            className={`text-white/70 hover:text-white hover:bg-white/10 ${
              hasActiveAgent ? 'text-white' : ''
            }`}
          >
            <Users className={`size-4 ${colorClass}`} />
            <span className="truncate">{group.template_display_name}</span>
            <span className="ml-auto mr-1 text-xs text-white/40">{group.agents.length}</span>
            <ChevronRight
              className={`size-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {group.agents.map((agent) => (
              <AgentNode
                key={agent.deployment_id}
                agent={agent}
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
  isActive: boolean
}

function AgentNode({ agent, isActive }: AgentNodeProps) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={isActive}
        className="text-white/60 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
      >
        <Link href={`/dashboard/agents/${agent.deployment_id}`}>
          <Bot className="size-3" />
          <span className="truncate">{agent.deployment_name}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}
