import { Star } from 'lucide-react'

export default function RatingStars({ rating, size = 16, showValue = false, reviewsCount }: { rating: number; size?: number; showValue?: boolean; reviewsCount?: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(n => (
          <Star key={n} size={size} className={n <= rounded ? 'fill-warning-400 text-warning-400' : 'fill-neutral-200 text-neutral-200'} />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-neutral-700">{rating > 0 ? rating.toFixed(1) : '—'}</span>}
      {reviewsCount !== undefined && <span className="text-xs text-neutral-500">({reviewsCount})</span>}
    </div>
  )
}
