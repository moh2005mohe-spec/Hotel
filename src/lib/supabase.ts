import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'http://localhost:54321'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-key'

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

export type Establishment = {
  id: string
  name: string
  type: 'hotel' | 'restaurant' | 'auberge' | 'gîte'
  city: string
  address: string | null
  description: string | null
  amenities: string[]
  price_range: 'budget' | 'mid-range' | 'luxury'
  phone: string | null
  email: string | null
  images: string[]
  cover_image: string | null
  partner_id: string | null
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  average_rating: number
  reviews_count: number
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export type Room = {
  id: string
  establishment_id: string
  name: string
  type: 'single' | 'double' | 'suite' | 'table'
  capacity: number
  price_per_night: number
  description: string | null
  amenities: string[]
  images: string[]
  quantity: number
  is_active: boolean
  created_at: string
}

export type Reservation = {
  id: string
  user_id: string
  establishment_id: string
  room_id: string
  check_in: string
  check_out: string
  guests: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  special_requests: string | null
  created_at: string
  updated_at: string
  establishment?: Establishment
  room?: Room
}

export type Review = {
  id: string
  user_id: string
  establishment_id: string
  reservation_id: string | null
  rating: number
  comment: string | null
  status: 'visible' | 'hidden' | 'reported'
  response: string | null
  response_at: string | null
  created_at: string
  establishment?: Establishment
  user?: { id: string; email?: string; full_name?: string }
}

export type Favorite = {
  id: string
  user_id: string
  establishment_id: string
  created_at: string
  establishment?: Establishment
}

export type Notification = {
  id: string
  user_id: string
  type: 'reservation' | 'review' | 'system' | 'message'
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export type UserRole = 'client' | 'partner' | 'admin'

export type AppUser = {
  id: string
  email: string
  full_name: string
  phone: string
  role: UserRole
}
