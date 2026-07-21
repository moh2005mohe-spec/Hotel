import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Calendar, Heart, Star, User, Bell, Building2, MessageSquare, Users, Shield } from 'lucide-react'
import type { UserRole } from '../lib/supabase'

type NavItem = { to: string; label: string; icon: React.ComponentType<{ size?: number }> }

export default function DashboardSidebar({ role }: { role: UserRole }) {
  const { t } = useTranslation()
  const items: Record<UserRole, NavItem[]> = {
    client: [
      { to: '/dashboard', label: t('dashboard.client.title'), icon: LayoutDashboard },
      { to: '/dashboard/reservations', label: t('dashboard.client.reservations'), icon: Calendar },
      { to: '/dashboard/favorites', label: t('dashboard.client.favorites'), icon: Heart },
      { to: '/dashboard/reviews', label: t('dashboard.client.reviews'), icon: Star },
      { to: '/dashboard/profile', label: t('dashboard.client.profile'), icon: User },
    ],
    partner: [
      { to: '/partner', label: t('dashboard.partner.overview'), icon: LayoutDashboard },
      { to: '/partner/establishments', label: t('dashboard.partner.establishments'), icon: Building2 },
      { to: '/partner/reservations', label: t('dashboard.partner.reservations'), icon: Calendar },
      { to: '/partner/reviews', label: t('dashboard.partner.reviews'), icon: MessageSquare },
    ],
    admin: [
      { to: '/admin', label: t('dashboard.admin.overview'), icon: LayoutDashboard },
      { to: '/admin/partners', label: t('dashboard.admin.partners'), icon: Building2 },
      { to: '/admin/users', label: t('dashboard.admin.users'), icon: Users },
      { to: '/admin/reservations', label: t('dashboard.admin.reservations'), icon: Calendar },
    ],
  }
  const roleItems = items[role]
  const icon = role === 'admin' ? <Shield size={20} /> : role === 'partner' ? <Building2 size={20} /> : <User size={20} />
  const title = role === 'admin' ? t('dashboard.admin.title') : role === 'partner' ? t('dashboard.partner.title') : t('dashboard.client.title')
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-primary-50 text-primary-700">{icon}<span className="font-semibold text-sm">{title}</span></div>
        {roleItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === `/${role === 'client' ? 'dashboard' : role}`}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}>
            <item.icon size={18} /><span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
