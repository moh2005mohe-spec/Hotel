import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { supabase, type Reservation } from '../../lib/supabase'
import { formatPrice, formatDate, statusBadgeClass } from '../../lib/utils'

export default function AdminReservations() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let q = supabase.from('reservations').select('*, establishment:establishments(*), room:rooms(*)').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setReservations(data ?? []); setLoading(false) })
  }, [filter])

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.admin.reservations')}</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">{filters.map(f => <button key={f} onClick={() => { setFilter(f); setLoading(true) }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}`}>{f === 'all' ? t('common.all') : t(`reservation.status.${f}`)}</button>)}</div>
      {loading ? <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}</div> : reservations.length === 0 ? <div className="card p-12 text-center"><Calendar size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucune réservation</p></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase"><tr><th className="text-left px-4 py-3">{t('dashboard.admin.establishments')}</th><th className="text-left px-4 py-3 hidden sm:table-cell">Dates</th><th className="text-left px-4 py-3">{t('common.price')}</th><th className="text-left px-4 py-3">{t('common.status')}</th></tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {reservations.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3"><p className="font-medium text-neutral-900">{r.establishment?.name}</p><p className="text-xs text-neutral-500">{r.establishment?.city} · {r.room?.name}</p></td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell text-xs">{formatDate(r.check_in, lang)} → {formatDate(r.check_out, lang)}</td>
                  <td className="px-4 py-3 font-medium text-primary-700">{formatPrice(Number(r.total_amount))}</td>
                  <td className="px-4 py-3"><span className={statusBadgeClass(r.status)}>{t(`reservation.status.${r.status}`)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
