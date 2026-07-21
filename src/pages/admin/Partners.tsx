import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, X, MapPin, Eye, Building2 } from 'lucide-react'
import { supabase, type Establishment } from '../../lib/supabase'
import { formatDate, statusBadgeClass } from '../../lib/utils'
import { getEstablishmentLabel } from '../../lib/constants'

export default function AdminPartners() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    let q = supabase.from('establishments').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setEstablishments(data ?? []); setLoading(false) })
  }, [filter])

  async function updateStatus(id: string, status: Establishment['status']) {
    await supabase.from('establishments').update({ status }).eq('id', id)
    setEstablishments(es => es.map(e => e.id === id ? { ...e, status } : e))
    const e = establishments.find(x => x.id === id)
    if (e?.partner_id) await supabase.from('notifications').insert({ user_id: e.partner_id, type: 'system', title: 'Mise à jour de votre établissement', message: `Votre établissement "${e.name}" est maintenant: ${status}` })
  }

  const filters = ['pending', 'active', 'suspended', 'rejected', 'all']

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.admin.partners')}</h1>
      <div className="flex gap-2 overflow-x-auto pb-2">{filters.map(f => <button key={f} onClick={() => { setFilter(f); setLoading(true) }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'}`}>{f === 'all' ? t('common.all') : f}</button>)}</div>
      {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card h-24 animate-pulse" />)}</div> : establishments.length === 0 ? <div className="card p-12 text-center"><Building2 size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucun établissement</p></div> : (
        <div className="space-y-3">
          {establishments.map(e => (
            <div key={e.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start">
              <img src={e.cover_image || e.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=200'} alt={e.name} className="w-full sm:w-24 h-24 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-neutral-900">{e.name}</h3><span className={statusBadgeClass(e.status)}>{e.status}</span></div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500"><span className="flex items-center gap-1"><MapPin size={14} /> {e.city}</span><span>{getEstablishmentLabel(e.type, lang)}</span><span>· {formatDate(e.created_at, lang)}</span></div>
                {e.description && <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{e.description}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/establishment/${e.id}`} className="btn-ghost text-sm"><Eye size={16} /> Voir</Link>
                {e.status === 'pending' && <><button onClick={() => updateStatus(e.id, 'active')} className="p-2 rounded-lg bg-success-500 text-white hover:bg-success-600" title="Approuver"><Check size={16} /></button><button onClick={() => updateStatus(e.id, 'rejected')} className="p-2 rounded-lg bg-error-500 text-white hover:bg-error-600" title="Rejeter"><X size={16} /></button></>}
                {e.status === 'active' && <button onClick={() => updateStatus(e.id, 'suspended')} className="btn-outline text-sm text-warning-700 border-warning-300">Suspendre</button>}
                {e.status === 'suspended' && <button onClick={() => updateStatus(e.id, 'active')} className="btn-outline text-sm text-success-700 border-success-300">Activer</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
