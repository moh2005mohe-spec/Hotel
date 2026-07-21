import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Heart, Star, Bell } from 'lucide-react'
import { supabase, type Reservation, type Establishment } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatPrice, formatDate } from '../../lib/utils'

type FavItem = { id: string; establishment_id: string; establishment?: Establishment }

export default function ClientDashboard() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [favorites, setFavorites] = useState<FavItem[]>([])
  const [reviewsCount, setReviewsCount] = useState(0)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('reservations').select('*, establishment:establishments(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('favorites').select('*, establishment:establishments(*)').eq('user_id', user.id).limit(4),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
    ]).then(([res, fav, rev, notif]) => {
      setReservations(res.data ?? [])
      setFavorites((fav.data ?? []) as FavItem[])
      setReviewsCount(rev.count ?? 0)
      setNotifCount(notif.count ?? 0)
    })
  }, [user])

  const stats = [
    { label: t('dashboard.client.reservations'), value: reservations.length, icon: Calendar, color: 'bg-secondary-50 text-secondary-600', link: '/dashboard/reservations' },
    { label: t('dashboard.client.favorites'), value: favorites.length, icon: Heart, color: 'bg-error-50 text-error-600', link: '/dashboard/favorites' },
    { label: t('dashboard.client.reviews'), value: reviewsCount, icon: Star, color: 'bg-warning-50 text-warning-600', link: '/dashboard/reviews' },
    { label: t('nav.notifications'), value: notifCount, icon: Bell, color: 'bg-primary-50 text-primary-600', link: '/dashboard' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-neutral-900">{t('auth.welcome')}, {user?.full_name?.split(' ')[0] || user?.email}</h1><p className="text-neutral-500">{t('dashboard.client.title')}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="card p-5 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon size={20} /></div>
            <div className="text-2xl font-bold text-neutral-900">{s.value}</div><div className="text-sm text-neutral-500">{s.label}</div>
          </Link>
        ))}
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-neutral-900">{t('dashboard.client.reservations')}</h2><Link to="/dashboard/reservations" className="text-sm text-primary-700 hover:underline">{t('common.actions')} →</Link></div>
        {reservations.length === 0 ? (
          <div className="text-center py-8"><Calendar size={32} className="mx-auto text-neutral-300 mb-2" /><p className="text-neutral-500 text-sm mb-3">Aucune réservation</p><Link to="/search" className="btn-primary text-sm">{t('nav.search')}</Link></div>
        ) : (
          <div className="space-y-3">
            {reservations.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors">
                <img src={r.establishment?.cover_image || r.establishment?.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=200'} alt={r.establishment?.name} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0"><p className="font-medium text-neutral-900 truncate">{r.establishment?.name}</p><p className="text-sm text-neutral-500">{formatDate(r.check_in, lang)} → {formatDate(r.check_out, lang)}</p></div>
                <div className="text-right"><div className="font-bold text-primary-700">{formatPrice(Number(r.total_amount))}</div><span className={r.status === 'confirmed' ? 'badge-success' : r.status === 'pending' ? 'badge-warning' : r.status === 'cancelled' ? 'badge-error' : 'badge-neutral'}>{t(`reservation.status.${r.status}`)}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {favorites.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-neutral-900">{t('dashboard.client.favorites')}</h2><Link to="/dashboard/favorites" className="text-sm text-primary-700 hover:underline">{t('common.actions')} →</Link></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {favorites.map(f => (
              <Link key={f.id} to={`/establishment/${f.establishment_id}`} className="group">
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2"><img src={f.establishment?.cover_image || f.establishment?.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=300'} alt={f.establishment?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                <p className="text-sm font-medium text-neutral-900 truncate">{f.establishment?.name}</p><p className="text-xs text-neutral-500">{f.establishment?.city}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
