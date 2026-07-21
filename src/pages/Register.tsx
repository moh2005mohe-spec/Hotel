import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, Phone, CircleAlert as AlertCircle, Building2, Hop as HomeIcon } from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { UserRole } from '../lib/supabase'

export default function Register() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp({ email, password, fullName, phone, role })
    setLoading(false)
    if (error) setError(error.includes('already') ? t('auth.error.exists') : error)
    else navigate(role === 'partner' ? '/partner' : '/dashboard')
  }

  const roles: { value: UserRole; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { value: 'client', label: t('auth.role.client'), icon: HomeIcon },
    { value: 'partner', label: t('auth.role.partner'), icon: Building2 },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">D</div>
            <h1 className="text-2xl font-bold text-neutral-900">{t('auth.register.title')}</h1>
            <p className="text-neutral-500 mt-1">{t('auth.register.subtitle')}</p>
          </div>
          {error && <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl flex items-center gap-2 text-sm text-error-700"><AlertCircle size={18} /> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">{t('auth.fullname')}</label><div className="relative"><User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={fullName} onChange={e => setFullName(e.target.value)} className="input pl-10" required placeholder="Ahmed Benali" /></div></div>
            <div><label className="label">{t('auth.email')}</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input pl-10" required placeholder="vous@exemple.com" /></div></div>
            <div><label className="label">{t('auth.phone')}</label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input pl-10" placeholder="+213 ..." /></div></div>
            <div><label className="label">{t('auth.password')}</label><div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input pl-10" required minLength={6} placeholder="••••••••" /></div></div>
            <div>
              <label className="label">{t('auth.role')}</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === r.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}>
                    <r.icon size={22} /><span className="text-sm font-medium">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? t('common.loading') : t('auth.register.button')}</button>
          </form>
          <p className="text-center text-sm text-neutral-600 mt-6">{t('auth.have_account')} <Link to="/login" className="text-primary-700 font-medium hover:underline">{t('auth.login_link')}</Link></p>
        </div>
      </div>
    </div>
  )
}
