import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, CreditCard as Edit, MapPin } from 'lucide-react'
import { supabase, type Establishment } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { statusBadgeClass } from '../../lib/utils'
import { getEstablishmentLabel } from '../../lib/constants'
import RatingStars from '../../components/RatingStars'

export default function PartnerEstablishments() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('establishments').select('*').eq('partner_id', user.id).order('created_at', { ascending: false }).then(({ data }) => { setEstablishments(data ?? []); setLoading(false) })
  }, [user])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.partner.establishments')}</h1>
        <Link to="/partner/establishments/new" className="btn-primary"><Plus size={18} /> {t('dashboard.partner.add')}</Link>
      </div>
      {loading ? <div className="space-y-3">{[1, 2].map(i => <div key={i} className="card h-32 animate-pulse" />)}</div> : establishments.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-neutral-500 mb-4">Aucun établissement. Commencez par en ajouter un !</p><Link to="/partner/establishments/new" className="btn-primary"><Plus size={18} /> {t('dashboard.partner.add')}</Link></div>
      ) : (
        <div className="space-y-3">
          {establishments.map(est => (
            <div key={est.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start">
              <img src={est.cover_image || est.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=300'} alt={est.name} className="w-full sm:w-32 h-32 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-neutral-900">{est.name}</h3><span className={statusBadgeClass(est.status)}>{est.status}</span></div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2"><span className="flex items-center gap-1"><MapPin size={14} /> {est.city}</span><span>{getEstablishmentLabel(est.type, lang)}</span></div>
                <RatingStars rating={Number(est.average_rating)} size={14} reviewsCount={est.reviews_count} />
              </div>
              <div className="flex gap-2">
                <Link to={`/establishment/${est.id}`} className="btn-ghost text-sm">Voir</Link>
                <Link to={`/partner/establishments/${est.id}/edit`} className="btn-outline text-sm"><Edit size={16} /> {t('common.edit')}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
