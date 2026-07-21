import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Mail, Share2, Heart, Calendar, Users, ArrowLeft, Check, Star, MessageSquare } from 'lucide-react'
import { supabase, type Establishment, type Room, type Review } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { formatPrice, formatDate, nightsBetween, todayISO, addDaysISO } from '../lib/utils'
import { getEstablishmentLabel, getPriceRangeLabel, getRoomTypeLabel, getAmenityLabel, AMENITY_ICONS } from '../lib/constants'
import RatingStars from '../components/RatingStars'
import ImageGallery from '../components/ImageGallery'

export default function EstablishmentDetail() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'

  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState(todayISO())
  const [checkOut, setCheckOut] = useState(addDaysISO(1))
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      supabase.from('establishments').select('*').eq('id', id).maybeSingle(),
      supabase.from('rooms').select('*').eq('establishment_id', id).eq('is_active', true),
      supabase.from('reviews').select('*, establishment:establishments(id,name)').eq('establishment_id', id).eq('status', 'visible').order('created_at', { ascending: false }).limit(10),
    ]).then(([estRes, roomsRes, revRes]) => {
      setEstablishment(estRes.data as Establishment | null)
      setRooms(roomsRes.data ?? [])
      setReviews(revRes.data ?? [])
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    supabase.from('favorites').select('id').eq('user_id', user.id).eq('establishment_id', id).maybeSingle().then(({ data }) => setIsFav(!!data))
  }, [user, id])

  async function toggleFav() {
    if (!user || !id) return navigate('/login')
    if (isFav) { await supabase.from('favorites').delete().eq('user_id', user.id).eq('establishment_id', id); setIsFav(false) }
    else { await supabase.from('favorites').insert({ user_id: user.id, establishment_id: id }); setIsFav(true) }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (!selectedRoom || !establishment) return
    setBooking(true); setBookingError('')
    const nights = nightsBetween(checkIn, checkOut)
    if (nights <= 0) { setBookingError('La date de départ doit être après l\'arrivée'); setBooking(false); return }
    const total = Number(selectedRoom.price_per_night) * nights
    const { error } = await supabase.from('reservations').insert({
      user_id: user.id, establishment_id: establishment.id, room_id: selectedRoom.id,
      check_in: checkIn, check_out: checkOut, guests, total_amount: total,
      special_requests: specialRequests, status: 'pending', payment_status: 'unpaid',
    })
    setBooking(false)
    if (error) setBookingError(error.message)
    else {
      setBookingSuccess(true)
      await supabase.from('notifications').insert({ user_id: user.id, type: 'reservation', title: 'Réservation créée', message: `Votre réservation chez ${establishment.name} est en attente de confirmation.` })
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !establishment) return navigate('/login')
    const { error } = await supabase.from('reviews').insert({ user_id: user.id, establishment_id: establishment.id, rating: reviewRating, comment: reviewComment })
    if (!error) {
      setShowReviewForm(false); setReviewComment(''); setReviewRating(5)
      supabase.from('reviews').select('*, establishment:establishments(id,name)').eq('establishment_id', establishment.id).eq('status', 'visible').order('created_at', { ascending: false }).limit(10).then(({ data }) => setReviews(data ?? []))
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>
  if (!establishment) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold text-neutral-900 mb-4">Établissement introuvable</h1><Link to="/search" className="btn-primary">{t('nav.search')}</Link></div>

  const nights = nightsBetween(checkIn, checkOut)
  const total = selectedRoom ? Number(selectedRoom.price_per_night) * nights : 0
  const allImages = establishment.images?.length ? establishment.images : (establishment.cover_image ? [establishment.cover_image] : [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/search" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-700 mb-4"><ArrowLeft size={16} /> {t('common.back')}</Link>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-info">{getEstablishmentLabel(establishment.type, lang)}</span>
            <span className="badge-neutral">{getPriceRangeLabel(establishment.price_range, lang)}</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">{establishment.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-neutral-600">
            <div className="flex items-center gap-1"><MapPin size={16} /> {establishment.city}</div>
            <RatingStars rating={Number(establishment.average_rating)} size={16} showValue reviewsCount={establishment.reviews_count} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleFav} className="btn-outline"><Heart size={18} className={isFav ? 'fill-error-500 text-error-500' : ''} /><span className="hidden sm:inline">{isFav ? t('establishment.fav_remove') : t('establishment.fav')}</span></button>
          <button onClick={() => navigator.share?.({ title: establishment.name, url: window.location.href }).catch(() => {})} className="btn-outline"><Share2 size={18} /></button>
        </div>
      </div>
      <div className="mb-8"><ImageGallery images={allImages} alt={establishment.name} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {establishment.description && (
            <section className="card p-6"><h2 className="text-xl font-bold text-neutral-900 mb-3">{t('footer.about')}</h2><p className="text-neutral-700 leading-relaxed whitespace-pre-line">{establishment.description}</p></section>
          )}
          {establishment.amenities?.length > 0 && (
            <section className="card p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">{t('establishment.amenities')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {establishment.amenities.map(a => { const Icon = AMENITY_ICONS[a]; return (
                  <div key={a} className="flex items-center gap-2 text-sm text-neutral-700">{Icon ? <Icon size={18} className="text-primary-600" /> : <Check size={18} className="text-primary-600" />}{getAmenityLabel(a, lang)}</div>
                )})}
              </div>
            </section>
          )}
          <section className="card p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">{t('establishment.rooms')}</h2>
            {rooms.length === 0 ? <p className="text-neutral-500 text-sm">{t('common.none')}</p> : (
              <div className="space-y-4">
                {rooms.map(room => (
                  <div key={room.id} className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all ${selectedRoom?.id === room.id ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-300'}`} onClick={() => setSelectedRoom(room)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-neutral-900">{room.name}</h3><span className="badge-neutral">{getRoomTypeLabel(room.type, lang)}</span></div>
                      {room.description && <p className="text-sm text-neutral-600 mb-2">{room.description}</p>}
                      <div className="flex items-center gap-4 text-sm text-neutral-500"><span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span><span>{t('common.price')}: <strong className="text-primary-700">{formatPrice(Number(room.price_per_night))}</strong> / {t('common.night')}</span></div>
                    </div>
                    <div className="text-right shrink-0"><span className="text-xs text-neutral-500 block">{t('establishment.price_from')}</span><div className="text-lg font-bold text-primary-700">{formatPrice(Number(room.price_per_night))}</div></div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">{t('establishment.reviews')} ({establishment.reviews_count})</h2>
              {user && <button onClick={() => setShowReviewForm(s => !s)} className="btn-outline text-sm"><Star size={16} /> {t('establishment.write_review')}</button>}
            </div>
            {showReviewForm && (
              <form onSubmit={submitReview} className="mb-6 p-4 bg-neutral-50 rounded-xl animate-fade-in">
                <div className="mb-3"><label className="label">{t('common.rating')}</label><div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => setReviewRating(n)}><Star size={28} className={n <= reviewRating ? 'fill-warning-400 text-warning-400' : 'text-neutral-300'} /></button>)}</div></div>
                <div className="mb-3"><label className="label">{t('common.description')}</label><textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3} className="input" placeholder="Partagez votre expérience..." /></div>
                <button type="submit" className="btn-primary">{t('common.save')}</button>
              </form>
            )}
            {reviews.length === 0 ? <p className="text-neutral-500 text-sm">{t('establishment.no_reviews')}</p> : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">{review.user?.full_name?.[0]?.toUpperCase() ?? review.user?.email?.[0]?.toUpperCase() ?? '?'}</div>
                        <div><p className="text-sm font-medium text-neutral-900">{review.user?.full_name || 'Anonyme'}</p><p className="text-xs text-neutral-500">{formatDate(review.created_at, lang)}</p></div>
                      </div>
                      <RatingStars rating={review.rating} size={14} />
                    </div>
                    {review.comment && <p className="text-sm text-neutral-700 leading-relaxed">{review.comment}</p>}
                    {review.response && (
                      <div className="mt-3 p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                        <p className="text-xs font-medium text-primary-700 mb-1 flex items-center gap-1"><MessageSquare size={12} /> Réponse du propriétaire</p>
                        <p className="text-sm text-neutral-700">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          {(establishment.phone || establishment.email) && (
            <section className="card p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">{t('footer.contact')}</h2>
              <div className="space-y-2">
                {establishment.phone && <a href={`tel:${establishment.phone}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-700"><Phone size={18} className="text-primary-600" /> {establishment.phone}</a>}
                {establishment.email && <a href={`mailto:${establishment.email}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-700"><Mail size={18} className="text-primary-600" /> {establishment.email}</a>}
              </div>
            </section>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 card p-6">
            {bookingSuccess ? (
              <div className="text-center py-6 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-success-100 text-success-600 flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
                <h3 className="font-bold text-neutral-900 mb-2">{t('reservation.success')}</h3>
                <Link to="/dashboard/reservations" className="btn-primary mt-4">{t('dashboard.client.reservations')}</Link>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">{t('reservation.title')}</h2>
                {selectedRoom && <p className="text-sm text-neutral-500 mb-4">{selectedRoom.name} · {formatPrice(Number(selectedRoom.price_per_night))}/{t('common.night')}</p>}
                <div className="space-y-3 mb-4">
                  <div><label className="label text-xs flex items-center gap-1"><Calendar size={12} /> {t('reservation.checkin')}</label><input type="date" value={checkIn} min={todayISO()} onChange={e => setCheckIn(e.target.value)} className="input" required /></div>
                  <div><label className="label text-xs flex items-center gap-1"><Calendar size={12} /> {t('reservation.checkout')}</label><input type="date" value={checkOut} min={addDaysISO(1, checkIn)} onChange={e => setCheckOut(e.target.value)} className="input" required /></div>
                  <div><label className="label text-xs flex items-center gap-1"><Users size={12} /> {t('reservation.guests')}</label><input type="number" min={1} max={selectedRoom?.capacity ?? 10} value={guests} onChange={e => setGuests(Number(e.target.value))} className="input" required /></div>
                  <div><label className="label text-xs">{t('reservation.special')}</label><textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={2} className="input" placeholder={t('reservation.special_placeholder')} /></div>
                </div>
                {nights > 0 && selectedRoom && (
                  <div className="border-t border-neutral-100 pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-1"><span className="text-neutral-600">{formatPrice(Number(selectedRoom.price_per_night))} × {nights} {nights > 1 ? t('common.nights') : t('common.night')}</span><span className="font-medium">{formatPrice(total)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-100 mt-2"><span>{t('reservation.total')}</span><span className="text-primary-700">{formatPrice(total)}</span></div>
                  </div>
                )}
                {bookingError && <p className="text-sm text-error-600 mb-3">{bookingError}</p>}
                <button type="submit" disabled={!selectedRoom || booking} className="btn-primary w-full">{booking ? t('common.loading') : t('reservation.confirm')}</button>
                {!selectedRoom && <p className="text-xs text-neutral-500 mt-2 text-center">Sélectionnez un hébergement</p>}
                {!user && <p className="text-xs text-neutral-500 mt-2 text-center">{t('auth.login.title')} pour réserver</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
