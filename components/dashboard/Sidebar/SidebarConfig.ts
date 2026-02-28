import {
  LayoutDashboard,
  type LucideIcon,
  Phone,
  Receipt,
  Settings,
  Users,
  Wallet,
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
      {
        title: 'Ma Conso',
        href: '/dashboard/consumption',
        icon: Wallet,
      },
    ],
  },
  // "Mes Agents" est insere dynamiquement via AgentTree dans AppSidebar
  {
    label: 'Financier',
    adminOnly: true, // Section visible uniquement pour les admins
    items: [
      {
        title: 'Dashboard Financier',
        href: '/dashboard/financial',
        icon: Receipt,
        adminOnly: true,
      },
    ],
  },
  {
    label: 'Administration',
    adminOnly: true,
    items: [
      {
        title: 'Historique Appels',
        href: '/dashboard/admin/calls',
        icon: Phone,
        adminOnly: true,
      },
    ],
  },
]

export const settingsNavItem: NavItem = {
  title: 'Parametres',
  href: '/dashboard/settings',
  icon: Settings,
}
