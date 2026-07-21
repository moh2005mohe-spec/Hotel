import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">D</div>
              <span className="text-xl font-bold text-white">{t('app.name')}</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">{t('app.tagline')}. {t('home.hero.subtitle')}.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{t('nav.search')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search?type=hotel" className="hover:text-primary-400 transition-colors">{t('home.types.hotel')}</Link></li>
              <li><Link to="/search?type=restaurant" className="hover:text-primary-400 transition-colors">{t('home.types.restaurant')}</Link></li>
              <li><Link to="/search?type=auberge" className="hover:text-primary-400 transition-colors">{t('home.types.auberge')}</Link></li>
              <li><Link to="/search?type=gîte" className="hover:text-primary-400 transition-colors">{t('home.types.gite')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">{t('footer.help')}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-10 pt-6 text-center text-sm text-neutral-500">© {new Date().getFullYear()} {t('app.name')}. {t('footer.rights')}.</div>
      </div>
    </footer>
  )
}
