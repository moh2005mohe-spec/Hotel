export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency', currency: 'DZD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string | Date, locale: 'fr' | 'ar' = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date, locale: 'fr' | 'ar' = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d)
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn)
  const outDate = new Date(checkOut)
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function addDaysISO(days: number, from?: string): string {
  const base = from ? new Date(from) : new Date()
  base.setDate(base.getDate() + days)
  return base.toISOString().split('T')[0]
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active': case 'confirmed': case 'completed': case 'paid': return 'badge-success'
    case 'pending': case 'unpaid': return 'badge-warning'
    case 'cancelled': case 'rejected': case 'refunded': case 'suspended': return 'badge-error'
    case 'visible': return 'badge-info'
    case 'hidden': case 'reported': return 'badge-neutral'
    default: return 'badge-neutral'
  }
}
