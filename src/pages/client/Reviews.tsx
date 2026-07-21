import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { supabase, type Review } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { formatDate } from '../../lib/utils'
import RatingStars from '../../components/RatingStars'

export default function ClientReviews() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('reviews').select('*, establishment:establishments(id, name, city)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => { setReviews(data ?? []); setLoading(false) })
  }, [user])

  async function remove(id: string) {
    if (!confirm('Supprimer cet avis ?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(rs => rs.filter(r => r.id !== id))
  }

  if (loading) return <div className="animate-pulse h-40 card" />

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.client.reviews')}</h1>
      {reviews.length === 0 ? <div className="card p-12 text-center"><Star size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucun avis pour le moment</p></div> : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div><Link to={`/establishment/${r.establishment_id}`} className="font-semibold text-neutral-900 hover:text-primary-700">{r.establishment?.name}</Link><p className="text-xs text-neutral-500">{formatDate(r.created_at, lang)}</p></div>
                <RatingStars rating={r.rating} size={16} />
              </div>
              {r.comment && <p className="text-neutral-700 text-sm leading-relaxed mb-3">{r.comment}</p>}
              {r.response && <div className="p-3 bg-primary-50/50 rounded-lg border border-primary-100"><p className="text-xs font-medium text-primary-700 mb-1">Réponse</p><p className="text-sm text-neutral-700">{r.response}</p></div>}
              <button onClick={() => remove(r.id)} className="text-sm text-error-600 hover:bg-error-50 px-3 py-1 rounded-lg mt-2">{t('common.delete')}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
