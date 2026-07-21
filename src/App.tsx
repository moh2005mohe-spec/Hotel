import { Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'
import { AlertCircle } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import EstablishmentDetail from './pages/EstablishmentDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientDashboard from './pages/client/Dashboard'
import ClientReservations from './pages/client/Reservations'
import ClientFavorites from './pages/client/Favorites'
import ClientReviews from './pages/client/Reviews'
import ClientProfile from './pages/client/Profile'
import PartnerDashboard from './pages/partner/Dashboard'
import PartnerEstablishments from './pages/partner/Establishments'
import PartnerEstablishmentForm from './pages/partner/EstablishmentForm'
import PartnerReservations from './pages/partner/Reservations'
import PartnerReviews from './pages/partner/Reviews'
import AdminDashboard from './pages/admin/Dashboard'
import AdminPartners from './pages/admin/Partners'
import AdminUsers from './pages/admin/Users'
import AdminReservations from './pages/admin/Reservations'
import NotFound from './pages/NotFound'

export default function App() {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-neutral-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col">
      {!isSupabaseConfigured && (
        <div className="bg-warning-50 border-b border-warning-200 px-4 py-3 text-center text-sm text-warning-800 flex items-center justify-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>Configuration en cours — les variables d'environnement ne sont pas encore définies. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les paramètres de votre hébergeur (Vercel).</span>
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/establishment/:id" element={<EstablishmentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['client']} />}>
            <Route index element={<ClientDashboard />} />
            <Route path="reservations" element={<ClientReservations />} />
            <Route path="favorites" element={<ClientFavorites />} />
            <Route path="reviews" element={<ClientReviews />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>
          <Route path="/partner" element={<ProtectedRoute roles={['partner', 'admin']} />}>
            <Route index element={<PartnerDashboard />} />
            <Route path="establishments" element={<PartnerEstablishments />} />
            <Route path="establishments/new" element={<PartnerEstablishmentForm />} />
            <Route path="establishments/:id/edit" element={<PartnerEstablishmentForm />} />
            <Route path="reservations" element={<PartnerReservations />} />
            <Route path="reviews" element={<PartnerReviews />} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reservations" element={<AdminReservations />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
