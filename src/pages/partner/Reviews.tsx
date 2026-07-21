import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Send } from 'lucide-react'
import { supabase, type Review } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatDate } from '../../lib/utils'
import RatingStars from '../../components/RatingStars'

export default function PartnerReviews() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: ests } = await supabase.from('establishments').select('id, name').eq('partner_id', user!.id)
      if (!ests || ests.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('reviews').select('*, establishment:establishments(id, name)').in('establishment_id', ests.map(e => e.id)).eq('status', 'visible').order('created_at', { ascending: false })
      setReviews(data ?? []); setLoading(false)
    }
    load()
  }, [user])

  async function respond(reviewId: string) {
    const text = responses[reviewId]
    if (!text) return
    await supabase.from('reviews').update({ response: text, response_at: new Date().toISOString() }).eq('id', reviewId)
    setReviews(rs => rs.map(r => r.id === reviewId ? { ...r, response: text, response_at: new Date().toISOString() } : r))
    setResponses(prev => ({ ...prev, [reviewId]: '' }))
  }

  if (loading) return <div className="animate-pulse h-40 card" />

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.partner.reviews')}</h1>
      {reviews.length === 0 ? <div className="card p-12 text-center"><MessageSquare size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucun avis</p></div> : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between mb-3"><div><p className="font-medium text-neutral-900">{r.establishment?.name}</p><p className="text-xs text-neutral-500">{formatDate(r.created_at, lang)}</p></div><RatingStars rating={r.rating} size={16} /></div>
              {r.comment && <p className="text-neutral-700 text-sm leading-relaxed mb-3">{r.comment}</p>}
              {r.response ? <div className="p-3 bg-primary-50/50 rounded-lg border border-primary-100"><p className="text-xs font-medium text-primary-700 mb-1">Votre réponse</p><p className="text-sm text-neutral-700">{r.response}</p></div> : (
                <div className="flex gap-2"><input value={responses[r.id] ?? ''} onChange={e => setResponses(prev => ({ ...prev, [r.id]: e.target.value }))} placeholder="Répondre à cet avis..." className="input flex-1 text-sm" /><button onClick={() => respond(r.id)} className="btn-primary text-sm"><Send size={16} /> {t('common.save')}</button></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
