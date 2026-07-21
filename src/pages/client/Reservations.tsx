import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin, X } from 'lucide-react'
import { supabase, type Reservation } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatPrice, formatDate, statusBadgeClass } from '../../lib/utils'

export default function ClientReservations() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    supabase.from('reservations').select('*, establishment:establishments(*), room:rooms(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => { setReservations(data ?? []); setLoading(false) })
  }, [user])

  async function cancel(id: string) {
    if (!confirm('Annuler cette réservation ?')) return
    await supabase.from('reservations').update({ status: 'cancelled' }).eq('id', id)
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)
  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.client.reservations')}</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}`}>{f === 'all' ? t('common.all') : t(`reservation.status.${f}`)}</button>)}
      </div>
      {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card p-4 h-24 animate-pulse" />)}</div> : filtered.length === 0 ? (
        <div className="card p-12 text-center"><Calendar size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500 mb-4">Aucune réservation</p><Link to="/search" className="btn-primary">{t('nav.search')}</Link></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <img src={r.establishment?.cover_image || r.establishment?.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=300'} alt={r.establishment?.name} className="w-full sm:w-28 h-28 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to={`/establishment/${r.establishment_id}`}><h3 className="font-semibold text-neutral-900 hover:text-primary-700">{r.establishment?.name}</h3></Link>
                <div className="flex items-center gap-1 text-sm text-neutral-500 mt-1"><MapPin size={14} /> {r.establishment?.city}</div>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-neutral-600"><span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(r.check_in, lang)} → {formatDate(r.check_out, lang)}</span><span>· {r.room?.name}</span><span>· {r.guests} pers.</span></div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <div className="text-right"><div className="font-bold text-primary-700">{formatPrice(Number(r.total_amount))}</div><span className={statusBadgeClass(r.status)}>{t(`reservation.status.${r.status}`)}</span></div>
                {(r.status === 'pending' || r.status === 'confirmed') && <button onClick={() => cancel(r.id)} className="text-sm text-error-600 hover:bg-error-50 px-3 py-1 rounded-lg flex items-center gap-1"><X size={14} /> {t('reservation.cancel')}</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
