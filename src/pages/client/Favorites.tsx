import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { supabase, type Establishment } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import EstablishmentCard from '../../components/EstablishmentCard'

export default function ClientFavorites() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('favorites').select('establishment:establishments(*)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      setFavorites((data ?? []).map((f: any) => f.establishment).filter(Boolean)); setLoading(false)
    })
  }, [user])

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.client.favorites')}</h1>
      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="card h-64 animate-pulse" />)}</div> : favorites.length === 0 ? (
        <div className="card p-12 text-center"><Heart size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500 mb-4">{t('search.no_results')}</p><Link to="/search" className="btn-primary">{t('nav.search')}</Link></div>
      ) : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{favorites.map(est => <EstablishmentCard key={est.id} establishment={est} />)}</div>}
    </div>
  )
}
