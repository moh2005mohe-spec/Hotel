import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Mail, Phone, Save, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function ClientProfile() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true); setError('')
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    setSaving(false)
    if (error) setError(error.message)
    else { setSaved(true); refreshUser(); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.client.profile')}</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-xl font-bold">{(fullName || user?.email)?.[0]?.toUpperCase()}</div>
          <div><p className="font-semibold text-neutral-900">{fullName || 'Utilisateur'}</p><p className="text-sm text-neutral-500">{user?.email}</p><span className="badge-info mt-1">{t(`auth.role.${user?.role}`)}</span></div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">{t('auth.fullname')}</label><div className="relative"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={fullName} onChange={e => setFullName(e.target.value)} className="input pl-10" /></div></div>
          <div><label className="label">{t('auth.email')}</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={user?.email ?? ''} disabled className="input pl-10 bg-neutral-50" /></div></div>
          <div><label className="label">{t('auth.phone')}</label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={phone} onChange={e => setPhone(e.target.value)} className="input pl-10" placeholder="+213 ..." /></div></div>
          {error && <p className="text-sm text-error-600">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary">{saved ? <><Check size={18} /> {t('common.success')}</> : <><Save size={18} /> {saving ? t('common.loading') : t('common.save')}</>}</button>
        </form>
      </div>
    </div>
  )
}
