import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'

type Profile = { id: string; email: string | null; full_name: string | null; phone: string | null; role: string; created_at: string }

export default function AdminUsers() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (roleFilter !== 'all') q = q.eq('role', roleFilter)
    q.then(({ data }) => {
      let filtered = data ?? []
      if (search) filtered = filtered.filter(u => (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()))
      setUsers(filtered); setLoading(false)
    })
  }, [roleFilter, search])

  async function changeRole(id: string, role: string) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    setUsers(us => us.map(u => u.id === id ? { ...u, role } : u))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.admin.users')}</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input pl-10" /></div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input sm:w-48"><option value="all">{t('common.all')}</option><option value="client">{t('auth.role.client')}</option><option value="partner">{t('auth.role.partner')}</option><option value="admin">{t('auth.role.admin')}</option></select>
      </div>
      {loading ? <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="card h-16 animate-pulse" />)}</div> : users.length === 0 ? <div className="card p-12 text-center"><Users size={40} className="mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Aucun utilisateur</p></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase"><tr><th className="text-left px-4 py-3">{t('common.name')}</th><th className="text-left px-4 py-3 hidden sm:table-cell">{t('common.email')}</th><th className="text-left px-4 py-3 hidden md:table-cell">{t('common.phone')}</th><th className="text-left px-4 py-3">{t('common.status')}</th><th className="text-left px-4 py-3 hidden lg:table-cell">{t('common.date')}</th></tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xs font-semibold">{(u.full_name || u.email || '?')[0]?.toUpperCase()}</div><div><p className="font-medium text-neutral-900">{u.full_name || '—'}</p><p className="text-xs text-neutral-500 sm:hidden">{u.email}</p></div></div></td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">{u.phone || '—'}</td>
                  <td className="px-4 py-3"><select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${u.role === 'admin' ? 'bg-warning-100 text-warning-700' : u.role === 'partner' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}><option value="client">{t('auth.role.client')}</option><option value="partner">{t('auth.role.partner')}</option><option value="admin">{t('auth.role.admin')}</option></select></td>
                  <td className="px-4 py-3 text-neutral-500 text-xs hidden lg:table-cell">{formatDate(u.created_at, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
