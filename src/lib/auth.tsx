import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured, type AppUser, type UserRole } from './supabase'
import i18n from './i18n'

type SignUpData = { email: string; password: string; fullName: string; phone: string; role: UserRole }

type AuthContextType = {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: SignUpData) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string): Promise<AppUser | null> {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role')
      .eq('id', userId)
      .maybeSingle()
    if (!data) return null
    return {
      id: data.id,
      email: data.email ?? '',
      full_name: data.full_name ?? '',
      phone: data.phone ?? '',
      role: (data.role as UserRole) ?? 'client',
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    let mounted = true
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (mounted) setUser(profile)
      }
      if (mounted) setLoading(false)
    }
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (mounted) setUser(profile)
        } else {
          if (mounted) setUser(null)
        }
        if (mounted) setLoading(false)
      })()
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }

  async function signUp(data: SignUpData) {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName, phone: data.phone, role: data.role } },
    })
    if (error) return { error: error.message }
    if (!signUpData.user) return { error: 'Failed to create account' }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function refreshUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      setUser(profile)
    }
  }

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
