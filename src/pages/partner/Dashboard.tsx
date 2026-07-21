import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, Calendar, Star, DollarSign, Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatPrice, formatDate } from '../../lib/utils'
import type { Establishment, Reservation } from '../../lib/supabase'

const COLORS = ['#f27617', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444']

export default function PartnerDashboard() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: ests } = await supabase.from('establishments').select('*').eq('partner_id', user!.id)
      setEstablishments(ests ?? [])
      if (ests && ests.length > 0) {
        const { data: resData } = await supabase.from('reservations').select('*, establishment:establishments(*)').in('establishment_id', ests.map(e => e.id)).order('created_at', { ascending: false })
        setReservations(resData ?? [])
        setRevenue((resData ?? []).filter(r => r.payment_status === 'paid').reduce((s, r) => s + Number(r.total_amount), 0))
      }
      setLoading(false)
    }
    load()
  }, [user])

  const stats = [
    { label: t('dashboard.partner.establishments'), value: establishments.length, icon: Building2, color: 'bg-secondary-50 text-secondary-600' },
    { label: t('dashboard.partner.reservations'), value: reservations.length, icon: Calendar, color: 'bg-primary-50 text-primary-600' },
    { label: 'Revenus', value: formatPrice(revenue), icon: DollarSign, color: 'bg-success-50 text-success-600' },
    { label: 'Note moyenne', value: (establishments.reduce((s, e) => s + Number(e.average_rating), 0) / (establishments.length || 1)).toFixed(1), icon: Star, color: 'bg-warning-50 text-warning-600' },
  ]

  const monthlyData = (() => {
    const months: Record<string, number> = {}
    reservations.forEach(r => { const m = new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'short' }); months[m] = (months[m] || 0) + 1 })
    return Object.entries(months).map(([month, count]) => ({ month, count }))
  })()
  const pieData = establishments.map(e => ({ name: e.name, value: reservations.filter(r => r.establishment_id === e.id).length })).filter(d => d.value > 0)

  if (loading) return <div className="animate-pulse h-40 card" />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.partner.title')}</h1><p className="text-neutral-500">{t('dashboard.partner.overview')}</p></div>
        <Link to="/partner/establishments/new" className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">{t('dashboard.partner.add')}</span></Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <div key={s.label} className="card p-5"><div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon size={20} /></div><div className="text-xl font-bold text-neutral-900 truncate">{s.value}</div><div className="text-sm text-neutral-500">{s.label}</div></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-neutral-900 mb-4">Réservations par mois</h2>
          {monthlyData.length === 0 ? <p className="text-neutral-500 text-sm text-center py-12">Pas encore de données</p> : <ResponsiveContainer width="100%" height={250}><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#f27617" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>}
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-neutral-900 mb-4">Par établissement</h2>
          {pieData.length === 0 ? <p className="text-neutral-500 text-sm text-center py-12">Pas encore de données</p> : <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip /></PieChart></ResponsiveContainer>}
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-neutral-900">{t('dashboard.partner.reservations')}</h2><Link to="/partner/reservations" className="text-sm text-primary-700 hover:underline">{t('common.actions')} →</Link></div>
        {reservations.length === 0 ? <p className="text-neutral-500 text-sm text-center py-8">Aucune réservation</p> : (
          <div className="space-y-2">
            {reservations.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 border border-neutral-100 rounded-xl">
                <div><p className="font-medium text-neutral-900 text-sm">{r.establishment?.name}</p><p className="text-xs text-neutral-500">{formatDate(r.check_in, lang)} → {formatDate(r.check_out, lang)}</p></div>
                <div className="text-right"><div className="font-bold text-primary-700 text-sm">{formatPrice(Number(r.total_amount))}</div><span className={r.status === 'confirmed' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : 'badge-neutral'}>{t(`reservation.status.${r.status}`)}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
