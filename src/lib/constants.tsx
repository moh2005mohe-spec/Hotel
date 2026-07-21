import {
  Wifi, Car, Utensils, Waves, Dumbbell, Snowflake, Tv,
  Coffee, Bath, Flame, Plane, BedDouble, Sparkles, Star,
  type LucideIcon,
} from 'lucide-react'

export const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi, parking: Car, restaurant: Utensils, pool: Waves,
  gym: Dumbbell, ac: Snowflake, tv: Tv, breakfast: Coffee,
  spa: Bath, fireplace: Flame, airport_shuttle: Plane,
  room_service: BedDouble, premium: Sparkles,
}

export const AMENITY_LABELS: Record<string, { fr: string; ar: string }> = {
  wifi: { fr: 'Wi-Fi', ar: 'واي فاي' },
  parking: { fr: 'Parking', ar: 'موقف سيارات' },
  restaurant: { fr: 'Restaurant', ar: 'مطعم' },
  pool: { fr: 'Piscine', ar: 'مسبح' },
  gym: { fr: 'Salle de sport', ar: 'صالة رياضية' },
  ac: { fr: 'Climatisation', ar: 'تكييف' },
  tv: { fr: 'TV', ar: 'تلفاز' },
  breakfast: { fr: 'Petit-déjeuner', ar: 'فطور' },
  spa: { fr: 'Spa', ar: 'سبا' },
  fireplace: { fr: 'Cheminée', ar: 'مدفأة' },
  airport_shuttle: { fr: 'Navette aéroport', ar: 'نقل المطار' },
  room_service: { fr: 'Service en chambre', ar: 'خدمة الغرف' },
  premium: { fr: 'Premium', ar: 'بريميوم' },
}

export const ALL_AMENITIES = Object.keys(AMENITY_LABELS)

export const ESTABLISHMENT_TYPES = [
  { value: 'hotel', labelFr: 'Hôtel', labelAr: 'فندق' },
  { value: 'restaurant', labelFr: 'Restaurant', labelAr: 'مطعم' },
  { value: 'auberge', labelFr: 'Auberge', labelAr: 'نُزل' },
  { value: 'gîte', labelFr: 'Gîte', labelAr: 'إقامة' },
] as const

export const PRICE_RANGES = [
  { value: 'budget', labelFr: 'Économique', labelAr: 'اقتصادي' },
  { value: 'mid-range', labelFr: 'Moyen', labelAr: 'متوسط' },
  { value: 'luxury', labelFr: 'Luxe', labelAr: 'فاخر' },
] as const

export const ROOM_TYPES = [
  { value: 'single', labelFr: 'Simple', labelAr: 'فردي' },
  { value: 'double', labelFr: 'Double', labelAr: 'مزدوج' },
  { value: 'suite', labelFr: 'Suite', labelAr: 'جناح' },
  { value: 'table', labelFr: 'Table', labelAr: 'طاولة' },
] as const

export const ALGERIAN_CITIES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif',
  'Tlemcen', 'Béjaïa', 'Tizi Ouzou', 'Skikda', 'Mostaganem', 'Sidi Bel Abbès',
  'Tiaret', 'Djelfa', 'Biskra', 'Ghardaïa', 'Laghouat', 'Ouargla', 'Adrar',
  'Tamanrasset', 'Béchar', 'El Oued', 'Jijel', 'Guelma', 'Médéa',
] as const

export function getAmenityLabel(key: string, lang: 'fr' | 'ar'): string {
  return AMENITY_LABELS[key]?.[lang] ?? key
}

export function getEstablishmentLabel(type: string, lang: 'fr' | 'ar'): string {
  const found = ESTABLISHMENT_TYPES.find(t => t.value === type)
  return found ? (lang === 'ar' ? found.labelAr : found.labelFr) : type
}

export function getPriceRangeLabel(range: string, lang: 'fr' | 'ar'): string {
  const found = PRICE_RANGES.find(r => r.value === range)
  return found ? (lang === 'ar' ? found.labelAr : found.labelFr) : range
}

export function getRoomTypeLabel(type: string, lang: 'fr' | 'ar'): string {
  const found = ROOM_TYPES.find(t => t.value === type)
  return found ? (lang === 'ar' ? found.labelAr : found.labelFr) : type
}
