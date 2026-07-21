import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Compass } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <Compass size={64} className="text-primary-300 mb-6" />
      <h1 className="text-5xl font-bold text-neutral-900 mb-2">404</h1>
      <p className="text-neutral-500 mb-6">Page introuvable</p>
      <Link to="/" className="btn-primary">{t('nav.home')}</Link>
    </div>
  )
}
