import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const imgs = images.length > 0 ? images : ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200']

  function prev(e: React.MouseEvent) { e.stopPropagation(); setActive(a => (a - 1 + imgs.length) % imgs.length) }
  function next(e: React.MouseEvent) { e.stopPropagation(); setActive(a => (a + 1) % imgs.length) }

  return (
    <>
      <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-80">
        <div className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden" onClick={() => setLightbox(true)}>
          <img src={imgs[active]} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {imgs.slice(1, 5).map((img, i) => (
          <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => setActive(i + 1)}>
            <img src={img} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setLightbox(false)}><X size={28} /></button>
          <button className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={prev}><ChevronLeft size={32} /></button>
          <img src={imgs[active]} alt={alt} className="max-w-full max-h-full object-contain rounded-lg" />
          <button className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={next}><ChevronRight size={32} /></button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-white/10 px-3 py-1 rounded-full">{active + 1} / {imgs.length}</span>
        </div>
      )}
    </>
  )
}
