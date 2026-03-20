import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStorage } from '../context/StorageContext'

const FEATURE_KEYS = {
  ai: { title: 'upgrade.aiTitle', desc: 'upgrade.aiDesc', features: 'upgrade.aiFeatures' },
  'ai-studio': { title: 'upgrade.aiStudioTitle', desc: 'upgrade.aiStudioDesc', features: 'upgrade.aiStudioFeatures' },
  sync: { title: 'upgrade.syncTitle', desc: 'upgrade.syncDesc', features: 'upgrade.syncFeatures' },
  export: { title: 'upgrade.exportTitle', desc: 'upgrade.exportDesc', features: 'upgrade.exportFeatures' },
  graph: { title: 'upgrade.graphTitle', desc: 'upgrade.graphDesc', features: 'upgrade.graphFeatures' },
}

export function UpgradeModal({ onClose, feature = 'ai' }) {
  const { t } = useTranslation()
  const { notes } = useStorage()
  const count = notes.length
  const keys = FEATURE_KEYS[feature] || FEATURE_KEYS.ai
  const features = t(keys.features, { returnObjects: true })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">{t(keys.title)}</h2>
        <p className="text-sm opacity-80 mb-4">{t(keys.desc, { count })}</p>
        <ul className="space-y-2 mb-6">
          {(Array.isArray(features) ? features : [features]).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--accent)' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-center"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            {t('upgrade.viewPricing')}
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 opacity-70 hover:opacity-100"
          >
            {t('upgrade.later')}
          </button>
        </div>
      </div>
    </div>
  )
}
