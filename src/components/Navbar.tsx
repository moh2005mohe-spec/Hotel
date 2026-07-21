import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Hop as HomeIcon, Search, Heart, Bell, User, LogOut, Menu, X, Building2, Shield, ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { getInitials } from '../lib/utils'
import i18n from '../lib/i18n'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lang, setLang] = useState<'fr' | 'ar'>('fr')
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return setUnreadCount(0)
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))
  }, [user, location.pathname])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location.pathname])

  function changeLang(l: 'fr' | 'ar') {
    setLang(l)
    i18n.changeLanguage(l)
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  const navLink = (to: string, label: string, icon: React.ReactNode) => {
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
    return (
      <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-primary-700 bg-primary-50' : 'text-neutral-600 hover:text-primary-700 hover:bg-neutral-100'}`}>
        {icon}<span>{label}</span>
      </Link>
    )
  }

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">D</div>
            <span className="text-xl font-bold text-neutral-900 hidden sm:block">{t('app.name')}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLink('/', t('nav.home'), <HomeIcon size={18} />)}
            {navLink('/search', t('nav.search'), <Search size={18} />)}
            {user && navLink('/dashboard/favorites', t('nav.favorites'), <Heart size={18} />)}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-100">
              <Globe size={18} className="text-neutral-500" />
              <button onClick={() => changeLang('fr')} className={`text-xs font-medium px-1.5 py-0.5 rounded ${lang === 'fr' ? 'text-primary-700 bg-primary-50' : 'text-neutral-500'}`}>FR</button>
              <button onClick={() => changeLang('ar')} className={`text-xs font-medium px-1.5 py-0.5 rounded ${lang === 'ar' ? 'text-primary-700 bg-primary-50' : 'text-neutral-500'}`}>AR</button>
            </div>
            {user ? (
              <>
                <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors" title={t('nav.notifications')}>
                  <Bell size={20} className="text-neutral-600" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold">{getInitials(user.full_name || user.email)}</div>
                    <ChevronDown size={16} className="text-neutral-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 animate-scale-in">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.full_name || 'Utilisateur'}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link to={dashboardLink} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><User size={16} /> {t('nav.dashboard')}</Link>
                      {user.role === 'partner' && <Link to="/partner/establishments" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><Building2 size={16} /> {t('nav.partner')}</Link>}
                      {user.role === 'admin' && <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><Shield size={16} /> {t('nav.admin')}</Link>}
                      <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50"><LogOut size={16} /> {t('nav.logout')}</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm">{t('nav.register')}</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-neutral-100">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLink('/', t('nav.home'), <HomeIcon size={18} />)}
            {navLink('/search', t('nav.search'), <Search size={18} />)}
            {user && navLink('/dashboard/favorites', t('nav.favorites'), <Heart size={18} />)}
            {user ? (
              <>
                {navLink(dashboardLink, t('nav.dashboard'), <User size={18} />)}
                <button onClick={() => { signOut(); navigate('/') }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50"><LogOut size={18} /> {t('nav.logout')}</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-outline flex-1 text-sm justify-center">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary flex-1 text-sm justify-center">{t('nav.register')}</Link>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-neutral-100">
              <button onClick={() => changeLang('fr')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'fr' ? 'bg-primary-50 text-primary-700' : 'text-neutral-500'}`}>Français</button>
              <button onClick={() => changeLang('ar')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'ar' ? 'bg-primary-50 text-primary-700' : 'text-neutral-500'}`}>العربية</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
