// Navigation Types - Dashboard Restructure V2
// Types pour la hierarchie entreprise/agent dans la sidebar

/**
 * Agent dans la hierarchie de navigation
 */
export interface HierarchyAgent {
  deployment_id: string
  deployment_name: string // ex: "Louis (setter)"
  slug: string
  agent_type_name: string // 'louis' | 'arthur' | 'alexandra'
  agent_type_display_name: string
  status: 'active' | 'paused' | 'archived'
  last_call_at: string | null
}

/**
 * Entreprise avec ses agents pour la navigation sidebar
 */
export interface HierarchyCompany {
  client_id: string
  client_name: string
  industry: string | null
  agents: HierarchyAgent[]
}

/**
 * Response de get_company_agent_hierarchy()
 */
export type CompanyAgentHierarchy = HierarchyCompany[]

/**
 * Etat de la navigation sidebar (expand/collapse)
 */
export interface SidebarNavState {
  expandedClients: string[]
}

/**
 * Props pour le composant AgentTree
 */
export interface AgentTreeProps {
  isAdmin: boolean
  viewAsUserId?: string | null
}

/**
 * Props pour un noeud entreprise dans l'arbre
 */
export interface CompanyNodeProps {
  company: HierarchyCompany
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Props pour un noeud agent dans l'arbre
 */
export interface AgentNodeProps {
  agent: HierarchyAgent
  clientName: string
}
