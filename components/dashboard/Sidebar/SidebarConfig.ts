import {
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  adminOnly?: boolean
  userOnly?: boolean // Visible uniquement pour les non-admins
}

export interface NavGroup {
  label: string
  items: NavItem[]
  adminOnly?: boolean
}

// NOTE: La section "Mes Agents" est maintenant dynamique via le composant AgentTree
// Elle n'apparait plus dans cette configuration statique

export const sidebarConfig: NavGroup[] = [
  {
    label: 'Platform',
    items: [
      {
        title: "Vue d'ensemble",
        href: '/dashboard/overview',
        icon: LayoutDashboard,
      },
      {
        title: 'Agents',
        href: '/dashboard/agents',
        icon: Users,
      },
    ],
  },
  // "Mes Agents" est insere dynamiquement via AgentTree dans AppSidebar
  {
    label: 'Gestion',
    items: [
      {
        title: 'Paramètres',
        href: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
]

export const settingsNavItem: NavItem = {
  title: 'Paramètres',
  href: '/dashboard/settings',
  icon: Settings,
}
