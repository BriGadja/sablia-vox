// Navigation Types — v2 schema
// Types for template-type-based agent tree in sidebar

/**
 * Agent in the sidebar navigation tree
 */
export interface HierarchyAgent {
  deployment_id: string
  deployment_name: string
  slug: string
  template_type: string // 'setter' | 'secretary' | 'transfer'
  template_display_name: string
  status: 'active' | 'inactive' | 'deploying' | 'error'
  last_call_at: string | null
}

/**
 * Template type group with its agents for sidebar navigation
 */
export interface HierarchyTemplateGroup {
  template_type: string
  template_display_name: string
  agents: HierarchyAgent[]
}

/**
 * Response shape: array of template groups
 */
export type AgentHierarchy = HierarchyTemplateGroup[]

/**
 * Sidebar navigation state (expand/collapse)
 */
export interface SidebarNavState {
  expandedGroups: string[]
}

/**
 * Props for the AgentTree component
 */
export interface AgentTreeProps {
  // no viewAsUserId needed in v2 — org scoped by JWT
}
