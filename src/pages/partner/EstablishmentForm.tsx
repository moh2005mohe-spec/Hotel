import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, X, Plus } from 'lucide-react'
import { supabase, type Establishment, type Room } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { ESTABLISHMENT_TYPES, PRICE_RANGES, ALGERIAN_CITIES, ALL_AMENITIES, ROOM_TYPES, getAmenityLabel } from '../../lib/constants'

const IMAGE_SUGGESTIONS = [
  'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg?auto=compress&cs=tinysrgb&w=800',
]

export default function PartnerEstablishmentForm() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const lang = i18n.language === 'ar' ? 'ar' : 'fr'
  const isEdit = !!id

  const [name, setName] = useState('')
  const [type, setType] = useState<Establishment['type']>('hotel')
  const [city, setCity] = useState('Alger')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [priceRange, setPriceRange] = useState<Establishment['price_range']>('mid-range')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [coverImage, setCoverImage] = useState(IMAGE_SUGGESTIONS[0])
  const [images, setImages] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [rooms, setRooms] = useState<Partial<Room>[]>([{ name: 'Chambre Standard', type: 'double', capacity: 2, price_per_night: 15000, quantity: 1, is_active: true }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    supabase.from('establishments').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        const e = data as Establishment
        setName(e.name); setType(e.type); setCity(e.city); setAddress(e.address ?? ''); setDescription(e.description ?? ''); setPriceRange(e.price_range); setPhone(e.phone ?? ''); setEmail(e.email ?? ''); setCoverImage(e.cover_image ?? IMAGE_SUGGESTIONS[0]); setImages(e.images ?? []); setAmenities(e.amenities ?? [])
      }
    })
    supabase.from('rooms').select('*').eq('establishment_id', id).then(({ data }) => { if (data && data.length > 0) setRooms(data) })
  }, [id])

  function toggleAmenity(a: string) { setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }
  function addImage() { setImages(prev => [...prev, IMAGE_SUGGESTIONS[(prev.length + 1) % IMAGE_SUGGESTIONS.length]]) }
  function updateRoom(idx: number, field: keyof Room, value: any) { setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r)) }
  function addRoom() { setRooms(prev => [...prev, { name: 'Nouvelle chambre', type: 'single', capacity: 1, price_per_night: 10000, quantity: 1, is_active: true }]) }
  function removeRoom(idx: number) { setRooms(prev => prev.filter((_, i) => i !== idx)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true); setError('')
    const payload = { name, type, city, address, description, price_range: priceRange, phone, email, cover_image: coverImage, images, amenities, partner_id: user.id }
    if (isEdit && id) {
      const { error } = await supabase.from('establishments').update(payload).eq('id', id)
      if (error) { setError(error.message); setSaving(false); return }
      await supabase.from('rooms').delete().eq('establishment_id', id)
      const roomInserts = rooms.map(r => ({ establishment_id: id, name: r.name!, type: r.type as Room['type'], capacity: Number(r.capacity), price_per_night: Number(r.price_per_night), description: r.description, quantity: Number(r.quantity), is_active: r.is_active ?? true }))
      if (roomInserts.length > 0) await supabase.from('rooms').insert(roomInserts)
    } else {
      const { data, error } = await supabase.from('establishments').insert(payload).select('id').single()
      if (error) { setError(error.message); setSaving(false); return }
      const roomInserts = rooms.map(r => ({ establishment_id: data.id, name: r.name!, type: r.type as Room['type'], capacity: Number(r.capacity), price_per_night: Number(r.price_per_night), description: r.description, quantity: Number(r.quantity), is_active: r.is_active ?? true }))
      if (roomInserts.length > 0) await supabase.from('rooms').insert(roomInserts)
    }
    setSaving(false); navigate('/partner/establishments')
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <Link to="/partner/establishments" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-700"><ArrowLeft size={16} /> {t('common.back')}</Link>
      <h1 className="text-2xl font-bold text-neutral-900">{isEdit ? t('common.edit') : t('dashboard.partner.add')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-neutral-900">Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">{t('common.name')} *</label><input value={name} onChange={e => setName(e.target.value)} className="input" required /></div>
            <div><label className="label">{t('common.type')} *</label><select value={type} onChange={e => setType(e.target.value as any)} className="input">{ESTABLISHMENT_TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.labelFr}</option>)}</select></div>
            <div><label className="label">{t('common.city')} *</label><select value={city} onChange={e => setCity(e.target.value)} className="input">{ALGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label">Adresse</label><input value={address} onChange={e => setAddress(e.target.value)} className="input" /></div>
            <div><label className="label">{t('common.phone')}</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+213 ..." /></div>
            <div><label className="label">{t('common.email')}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" /></div>
            <div><label className="label">{t('search.price')}</label><select value={priceRange} onChange={e => setPriceRange(e.target.value as any)} className="input">{PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.labelFr}</option>)}</select></div>
          </div>
          <div><label className="label">{t('common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="input" /></div>
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-neutral-900">Image de couverture</h2>
          <div className="grid grid-cols-5 gap-2">
            {IMAGE_SUGGESTIONS.map(img => <button key={img} type="button" onClick={() => setCoverImage(img)} className={`aspect-square rounded-lg overflow-hidden border-2 ${coverImage === img ? 'border-primary-500' : 'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>)}
          </div>
          <div className="flex items-center justify-between"><h3 className="font-medium text-neutral-900 text-sm">Images supplémentaires</h3><button type="button" onClick={addImage} className="btn-ghost text-sm"><Plus size={16} /> Ajouter</button></div>
          {images.length > 0 && <div className="grid grid-cols-4 gap-2">{images.map((img, i) => <div key={i} className="relative aspect-square rounded-lg overflow-hidden group"><img src={img} alt="" className="w-full h-full object-cover" /><button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} className="mx-auto" /></button></div>)}</div>}
        </div>
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-neutral-900">{t('common.amenities')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{ALL_AMENITIES.map(a => <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border-2 transition-all ${amenities.includes(a) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-600'}`}>{getAmenityLabel(a, lang)}</button>)}</div>
        </div>
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between"><h2 className="font-bold text-neutral-900">{t('establishment.rooms')}</h2><button type="button" onClick={addRoom} className="btn-ghost text-sm"><Plus size={16} /> Ajouter</button></div>
          {rooms.map((room, idx) => (
            <div key={idx} className="border border-neutral-200 rounded-xl p-4 space-y-3 relative">
              <button type="button" onClick={() => removeRoom(idx)} className="absolute top-3 right-3 text-error-500 hover:bg-error-50 p-1 rounded"><X size={16} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label text-xs">Nom</label><input value={room.name ?? ''} onChange={e => updateRoom(idx, 'name', e.target.value)} className="input" /></div>
                <div><label className="label text-xs">Type</label><select value={room.type ?? 'single'} onChange={e => updateRoom(idx, 'type', e.target.value)} className="input">{ROOM_TYPES.map(r => <option key={r.value} value={r.value}>{r.labelFr}</option>)}</select></div>
                <div><label className="label text-xs">Capacité</label><input type="number" min={1} value={room.capacity ?? 1} onChange={e => updateRoom(idx, 'capacity', e.target.value)} className="input" /></div>
                <div><label className="label text-xs">Prix/nuit (DZD)</label><input type="number" min={0} value={room.price_per_night ?? 0} onChange={e => updateRoom(idx, 'price_per_night', e.target.value)} className="input" /></div>
                <div><label className="label text-xs">Quantité</label><input type="number" min={1} value={room.quantity ?? 1} onChange={e => updateRoom(idx, 'quantity', e.target.value)} className="input" /></div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="p-3 bg-error-50 border border-error-200 rounded-xl text-sm text-error-700">{error}</div>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary"><Save size={18} /> {saving ? t('common.loading') : t('common.save')}</button>
          <Link to="/partner/establishments" className="btn-outline">{t('common.cancel')}</Link>
        </div>
      </form>
    </div>
  )
}
