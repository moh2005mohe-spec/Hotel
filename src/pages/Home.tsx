import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, MapPin, Building2, ArrowRight, Utensils, Hop as HomeIcon, Tent, Star } from 'lucide-react'
import { supabase, type Establishment } from '../lib/supabase'
import EstablishmentCard from '../components/EstablishmentCard'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchType, setSearchType] = useState('')

  useEffect(() => {
    supabase.from('establishments').select('*').eq('status', 'active')
      .order('average_rating', { ascending: false }).order('reviews_count', { ascending: false })
      .limit(6).then(({ data }) => { setFeatured(data ?? []); setLoading(false) })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchCity) params.set('city', searchCity)
    if (searchType) params.set('type', searchType)
    navigate(`/search?${params.toString()}`)
  }

  const types = [
    { value: 'hotel', icon: Building2, label: t('home.types.hotel') },
    { value: 'restaurant', icon: Utensils, label: t('home.types.restaurant') },
    { value: 'auberge', icon: HomeIcon, label: t('home.types.auberge') },
    { value: 'gîte', icon: Tent, label: t('home.types.gite') },
  ]

  return (
    <div>
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Algérie" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/50 to-neutral-900/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in">{t('home.hero.title')}</h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in">{t('home.hero.subtitle')}</p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-3xl mx-auto animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-left">
                <label className="label flex items-center gap-1 text-xs"><MapPin size={14} /> {t('home.hero.where')}</label>
                <input type="text" value={searchCity} onChange={e => setSearchCity(e.target.value)} placeholder="Alger, Oran..." className="input" />
              </div>
              <div className="text-left">
                <label className="label flex items-center gap-1 text-xs"><Building2 size={14} /> {t('search.type')}</label>
                <select value={searchType} onChange={e => setSearchType(e.target.value)} className="input">
                  <option value="">{t('search.all_types')}</option>
                  <option value="hotel">{t('home.types.hotel')}</option>
                  <option value="restaurant">{t('home.types.restaurant')}</option>
                  <option value="auberge">{t('home.types.auberge')}</option>
                  <option value="gîte">{t('home.types.gite')}</option>
                </select>
              </div>
              <div className="flex items-end"><button type="submit" className="btn-primary w-full"><SearchIcon size={18} /> {t('home.hero.search')}</button></div>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 text-center mb-2">{t('home.types.title')}</h2>
        <p className="text-neutral-500 text-center mb-10">{t('home.featured.subtitle')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {types.map(type => (
            <Link key={type.value} to={`/search?type=${type.value}`} className="card p-6 text-center group hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-600 group-hover:text-white transition-colors"><type.icon size={26} /></div>
              <h3 className="font-semibold text-neutral-900">{type.label}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t('home.featured.title')}</h2><p className="text-neutral-500 mt-1">{t('home.featured.subtitle')}</p></div>
          <Link to="/search" className="btn-ghost text-sm hidden sm:inline-flex">{t('search.filter')} <ArrowRight size={16} /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="card overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-neutral-200" /><div className="p-4 space-y-3"><div className="h-4 bg-neutral-200 rounded w-3/4" /><div className="h-3 bg-neutral-200 rounded w-1/2" /><div className="h-3 bg-neutral-200 rounded w-full" /></div></div>)}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{featured.map(est => <EstablishmentCard key={est.id} establishment={est} />)}</div>
        ) : (
          <div className="text-center py-16"><Star size={48} className="mx-auto text-neutral-300 mb-4" /><p className="text-neutral-500">{t('search.no_results')}</p></div>
        )}
      </section>

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-white/80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('home.cta.title')}</h2>
          <p className="text-lg text-white/90 mb-6">{t('home.cta.subtitle')}</p>
          <Link to="/register" className="btn bg-white text-primary-700 hover:bg-neutral-100 shadow-md">{t('home.cta.button')} <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  )
}
