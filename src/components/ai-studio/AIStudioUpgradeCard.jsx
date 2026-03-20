import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function AIStudioUpgradeCard() {
  const { t } = useTranslation()
  return (
    <div
      className="p-6 rounded-xl border text-center"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--accent)',
        color: 'var(--text-primary)',
      }}
    >
      <h3 className="text-lg font-semibold mb-2">{t('aiStudio.upgradeTitle')}</h3>
      <p className="text-sm opacity-80 mb-4">
        {t('aiStudio.upgradeDesc')}
      </p>
      <ul className="text-xs opacity-70 text-left max-w-xs mx-auto mb-6 space-y-1">
        <li>• {t('aiStudio.upgradeFeature1')}</li>
        <li>• {t('aiStudio.upgradeFeature2')}</li>
        <li>• {t('aiStudio.upgradeFeature3')}</li>
      </ul>
      <Link
        to="/pricing"
        className="inline-block px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
      >
        {t('aiStudio.upgradeMax')}
      </Link>
    </div>
  )
}
