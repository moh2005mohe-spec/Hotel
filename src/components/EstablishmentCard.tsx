import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Heart } from 'lucide-react'
import type { Establishment } from '../lib/supabase'
import { formatPrice } from '../lib/utils'
import { getEstablishmentLabel, getPriceRangeLabel } from '../lib/constants'
import RatingStars from './RatingStars'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800'

export default function EstablishmentCard({ establishment }: { establishment: Establishment }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [fav, setFav] = useState(false)
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault()
    if (!user) return
    if (fav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('establishment_id', establishment.id)
      setFav(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, establishment_id: establishment.id })
      setFav(true)
    }
  }

  const image = establishment.cover_image || establishment.images?.[0] || DEFAULT_IMAGE
  return (
    <Link to={`/establishment/${establishment.id}`} className="card group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img src={image} alt={establishment.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3"><span className="badge bg-white/90 text-neutral-800 backdrop-blur-sm">{getEstablishmentLabel(establishment.type, lang)}</span></div>
        {user && (
          <button onClick={toggleFav} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Heart size={18} className={fav ? 'fill-error-500 text-error-500' : 'text-neutral-400'} />
          </button>
        )}
        <div className="absolute bottom-3 right-3"><span className="badge bg-neutral-900/80 text-white backdrop-blur-sm">{getPriceRangeLabel(establishment.price_range, lang)}</span></div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary-700 transition-colors mb-1">{establishment.name}</h3>
        <div className="flex items-center gap-1 text-sm text-neutral-500 mb-2"><MapPin size={14} /><span className="line-clamp-1">{establishment.city}</span></div>
        {establishment.description && <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{establishment.description}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <RatingStars rating={Number(establishment.average_rating)} reviewsCount={establishment.reviews_count} size={14} />
          <div className="text-right">
            <span className="text-xs text-neutral-500 block">{t('establishment.price_from')}</span>
            <span className="font-bold text-primary-700">{formatPrice(12000)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
