import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { supabase, type Establishment } from '../lib/supabase'
import { ESTABLISHMENT_TYPES, PRICE_RANGES, ALGERIAN_CITIES } from '../lib/constants'
import EstablishmentCard from '../components/EstablishmentCard'

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const query = searchParams.get('q') ?? ''
  const city = searchParams.get('city') ?? ''
  const type = searchParams.get('type') ?? ''
  const priceRange = searchParams.get('price') ?? ''
  const minRating = searchParams.get('rating') ?? ''
  const sort = searchParams.get('sort') ?? 'popular'

  const fetchEstablishments = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('establishments').select('*').eq('status', 'active')
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    if (city) q = q.ilike('city', `%${city}%`)
    if (type) q = q.eq('type', type)
    if (priceRange) q = q.eq('price_range', priceRange)
    if (minRating) q = q.gte('average_rating', Number(minRating))
    switch (sort) {
      case 'price_low': q = q.order('average_rating', { ascending: true }); break
      case 'price_high': q = q.order('average_rating', { ascending: false }); break
      case 'rating': q = q.order('average_rating', { ascending: false }).order('reviews_count', { ascending: false }); break
      default: q = q.order('reviews_count', { ascending: false }).order('average_rating', { ascending: false })
    }
    const { data } = await q.limit(30)
    setEstablishments(data ?? [])
    setLoading(false)
  }, [query, city, type, priceRange, minRating, sort])

  useEffect(() => { fetchEstablishments() }, [fetchEstablishments])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next)
  }
  function clearFilters() { setSearchParams(new URLSearchParams()) }

  const hasFilters = !!(query || city || type || priceRange || minRating)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="text" value={query} onChange={e => updateParam('q', e.target.value)} placeholder={t('search.placeholder')} className="input pl-10" />
          </div>
          <button onClick={() => setShowFilters(s => !s)} className={`btn-outline ${showFilters ? 'border-primary-500 text-primary-700' : ''}`}><SlidersHorizontal size={18} /> <span className="hidden sm:inline">{t('search.filter')}</span></button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
            <div><label className="label text-xs">{t('common.city')}</label><select value={city} onChange={e => updateParam('city', e.target.value)} className="input"><option value="">{t('common.all')}</option>{ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label text-xs">{t('search.type')}</label><select value={type} onChange={e => updateParam('type', e.target.value)} className="input"><option value="">{t('search.all_types')}</option>{ESTABLISHMENT_TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.labelFr}</option>)}</select></div>
            <div><label className="label text-xs">{t('search.price')}</label><select value={priceRange} onChange={e => updateParam('price', e.target.value)} className="input"><option value="">{t('search.all_prices')}</option>{PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.labelFr}</option>)}</select></div>
            <div><label className="label text-xs">{t('search.rating')}</label><select value={minRating} onChange={e => updateParam('rating', e.target.value)} className="input"><option value="">{t('common.all')}</option><option value="3">3+ ★</option><option value="4">4+ ★</option><option value="4.5">4.5+ ★</option></select></div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-neutral-600">{loading ? t('common.loading') : t('search.results', { count: establishments.length })}</p>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input py-2 text-sm w-auto">
            <option value="popular">{t('search.sort.popular')}</option>
            <option value="rating">{t('search.sort.rating')}</option>
            <option value="price_low">{t('search.sort.price_low')}</option>
            <option value="price_high">{t('search.sort.price_high')}</option>
          </select>
          {hasFilters && <button onClick={clearFilters} className="btn-ghost text-sm"><X size={16} /> {t('search.clear')}</button>}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-neutral-200" /><div className="p-4 space-y-3"><div className="h-4 bg-neutral-200 rounded w-3/4" /><div className="h-3 bg-neutral-200 rounded w-1/2" /><div className="h-3 bg-neutral-200 rounded w-full" /></div></div>)}
        </div>
      ) : establishments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{establishments.map(est => <EstablishmentCard key={est.id} establishment={est} />)}</div>
      ) : (
        <div className="text-center py-20"><SearchIcon size={48} className="mx-auto text-neutral-300 mb-4" /><p className="text-neutral-500 text-lg">{t('search.no_results')}</p>{hasFilters && <button onClick={clearFilters} className="btn-outline mt-4">{t('search.clear')}</button>}</div>
      )}
    </div>
  )
}
