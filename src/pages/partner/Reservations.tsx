import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, X, Calendar, MapPin } from 'lucide-react'
import { supabase, type Reservation } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatPrice, formatDate, statusBadgeClass } from '../../lib/utils'

export default function PartnerReservations() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: ests } = await supabase.from('establishments').select('id').eq('partner_id', user!.id)
      if (!ests || ests.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('reservations').select('*, establishment:establishments(*), room:rooms(*)').in('establishment_id', ests.map(e => e.id)).order('created_at', { ascending: false })
      setReservations(data ?? []); setLoading(false)
    }
    load()
  }, [user])

  async function updateStatus(id: string, status: Reservation['status']) {
    await supabase.from('reservations').update({ status }).eq('id', id)
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status } : r))
    const r = reservations.find(x => x.id === id)
    if (r && r.user_id) await supabase.from('notifications').insert({ user_id: r.user_id, type: 'reservation', title: 'Réservation mise à jour', message: `Votre réservation chez ${r.establishment?.name} est maintenant: ${t(`reservation.status.${status}`)}` })
  }

  if (loading) return <div className="animate-pulse h-40 card" />

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.partner.reservations')}</h1>
      {reservations.length === 0 ? <div className="card p-12 text-center"><Calendar size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucune réservation</p></div> : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900">{r.establishment?.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mt-1"><span className="flex items-center gap-1"><MapPin size={14} /> {r.establishment?.city}</span><span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(r.check_in, lang)} → {formatDate(r.check_out, lang)}</span><span>· {r.room?.name}</span><span>· {r.guests} pers.</span></div>
                {r.special_requests && <p className="text-xs text-neutral-500 mt-2 italic">« {r.special_requests} »</p>}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right"><div className="font-bold text-primary-700">{formatPrice(Number(r.total_amount))}</div><span className={statusBadgeClass(r.status)}>{t(`reservation.status.${r.status}`)}</span></div>
                {r.status === 'pending' && <div className="flex gap-1"><button onClick={() => updateStatus(r.id, 'confirmed')} className="p-2 rounded-lg bg-success-500 text-white hover:bg-success-600" title="Confirmer"><Check size={16} /></button><button onClick={() => updateStatus(r.id, 'rejected')} className="p-2 rounded-lg bg-error-500 text-white hover:bg-error-600" title="Refuser"><X size={16} /></button></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
