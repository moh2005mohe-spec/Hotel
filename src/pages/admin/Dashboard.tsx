import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, Users, DollarSign, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Establishment } from '../../lib/supabase'

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [stats, setStats] = useState({ establishments: 0, pending: 0, users: 0, reservations: 0, revenue: 0 })
  const [recentEst, setRecentEst] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [est, pend, usr, res, recent] = await Promise.all([
        supabase.from('establishments').select('id', { count: 'exact', head: true }),
        supabase.from('establishments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('total_amount, payment_status'),
        supabase.from('establishments').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ establishments: est.count ?? 0, pending: pend.count ?? 0, users: usr.count ?? 0, reservations: res.data?.length ?? 0, revenue: (res.data ?? []).filter(r => r.payment_status === 'paid').reduce((s, r) => s + Number(r.total_amount), 0) })
      setRecentEst(recent.data ?? []); setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: t('dashboard.admin.establishments'), value: stats.establishments, icon: Building2, color: 'bg-secondary-50 text-secondary-600' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'bg-warning-50 text-warning-600' },
    { label: t('dashboard.admin.users'), value: stats.users, icon: Users, color: 'bg-primary-50 text-primary-600' },
    { label: 'Revenus', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-success-50 text-success-600' },
  ]

  if (loading) return <div className="animate-pulse h-40 card" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.admin.title')}</h1><p className="text-neutral-500">{t('dashboard.admin.overview')}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{statCards.map(s => <div key={s.label} className="card p-5"><div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon size={20} /></div><div className="text-xl font-bold text-neutral-900 truncate">{s.value}</div><div className="text-sm text-neutral-500">{s.label}</div></div>)}</div>
      {stats.pending > 0 && <div className="card p-4 bg-warning-50 border-warning-200"><div className="flex items-center gap-3"><Clock size={20} className="text-warning-600" /><p className="text-sm text-warning-800"><strong>{stats.pending}</strong> établissement(s) en attente de validation</p><Link to="/admin/partners" className="ml-auto btn-outline text-sm border-warning-300 text-warning-700">Examiner</Link></div></div>}
      <div className="card p-6">
        <h2 className="font-bold text-neutral-900 mb-4">{t('dashboard.admin.establishments')}</h2>
        {recentEst.length === 0 ? <p className="text-neutral-500 text-sm text-center py-8">Aucun établissement</p> : (
          <div className="space-y-2">
            {recentEst.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl">
                <div className="flex items-center gap-3"><img src={e.cover_image || e.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=100'} alt={e.name} className="w-10 h-10 rounded-lg object-cover" /><div><p className="font-medium text-neutral-900 text-sm">{e.name}</p><p className="text-xs text-neutral-500">{e.city} · {formatDate(e.created_at, lang)}</p></div></div>
                <span className={e.status === 'active' ? 'badge-success' : e.status === 'pending' ? 'badge-warning' : 'badge-neutral'}>{e.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
