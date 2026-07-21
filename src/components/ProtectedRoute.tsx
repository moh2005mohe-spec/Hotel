import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { UserRole } from '../lib/supabase'
import DashboardSidebar from './DashboardSidebar'

export default function ProtectedRoute({ roles }: { roles: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard'
    return <Navigate to={home} replace />
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6">
        <DashboardSidebar role={user.role} />
        <div className="flex-1 min-w-0"><Outlet /></div>
      </div>
    </div>
  )
}
