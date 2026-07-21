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
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rateLimitWait, setRateLimitWait] = useState(0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (rateLimitWait > 0) {
      setError(t('auth.error.rate_limit') || `جاهر تماما، انتظر ${rateLimitWait} ثانية`)
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)
    
    const { error } = await signUp({ email, password, fullName, phone, role })
    setLoading(false)
    
    if (error) {
      console.log('[v0] Sign up error:', error)
      
      if (error.includes('rate limit') || error.includes('rate_limit') || error.includes('too many')) {
        setRateLimitWait(60)
        const interval = setInterval(() => {
          setRateLimitWait(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        setError(t('auth.error.rate_limit_wait') || 'تم تجاوز حد الرسائل المسموح. يرجى الانتظار 60 ثانية قبل المحاولة مجددا')
      } else {
        setError(error.includes('already') ? t('auth.error.exists') : error)
      }
    } else {
      console.log('[v0] Sign up successful, showing confirmation message')
      setSuccess(true)
    }
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
          {success && (
            <div className="space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
                <p className="text-sm font-medium text-success-900">{t('auth.register.success_title')}</p>
                <p className="text-sm text-success-800 mt-1">{t('auth.register.check_email')}</p>
                <p className="text-xs text-success-700 mt-2">⏳ {t('auth.register.link_expires')}</p>
                <p className="text-xs text-success-700 mt-3">📧 {email}</p>
              </div>
              <button onClick={() => { setSuccess(false); setEmail(''); }} type="button" className="btn-secondary w-full">{t('auth.register.back')}</button>
            </div>
          )}
          {!success && (
            <>
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
                <button type="submit" disabled={loading || rateLimitWait > 0} className="btn-primary w-full">{loading ? t('common.loading') : rateLimitWait > 0 ? `${t('auth.wait')} ${rateLimitWait}s` : t('auth.register.button')}</button>
              </form>
              <p className="text-center text-sm text-neutral-600 mt-6">{t('auth.have_account')} <Link to="/login" className="text-primary-700 font-medium hover:underline">{t('auth.login_link')}</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
