import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, CircleAlert as AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.includes('Invalid login') ? t('auth.error.invalid') : error)
    else {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'
      navigate(from)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">D</div>
            <h1 className="text-2xl font-bold text-neutral-900">{t('auth.login.title')}</h1>
            <p className="text-neutral-500 mt-1">{t('auth.login.subtitle')}</p>
          </div>
          {error && <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-xl flex items-center gap-2 text-sm text-error-700"><AlertCircle size={18} /> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('auth.email')}</label>
              <div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input pl-10" required placeholder="vous@exemple.com" /></div>
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input pl-10" required placeholder="••••••••" /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? t('common.loading') : t('auth.login.button')}</button>
          </form>
          <p className="text-center text-sm text-neutral-600 mt-6">{t('auth.no_account')} <Link to="/register" className="text-primary-700 font-medium hover:underline">{t('auth.signup_link')}</Link></p>
        </div>
      </div>
    </div>
  )
}
