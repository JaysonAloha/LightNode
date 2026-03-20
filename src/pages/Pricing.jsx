import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

const PLAN_IDS = ['free', 'pro', 'team', 'max']

const PLAN_META = {
  free: { price: '$0', highlight: false },
  pro: { price: '$8', highlight: true },
  team: { price: '$15', highlight: false },
  max: { price: '$20', highlight: false },
}

export function Pricing() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const isCozy = theme === 'cozy'

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">{t('pricing.title')}</h1>
        <p className="text-center opacity-80 mb-12">{t('pricing.subtitle')}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PLAN_IDS.map((id) => {
            const meta = PLAN_META[id]
            const features = t(`pricing.${id}.features`, { returnObjects: true })
            return (
              <div
                key={id}
                className={`
                  p-6 border flex flex-col
                  ${meta.highlight ? 'ring-2' : ''}
                  ${isCozy ? 'rounded-2xl' : 'rounded-none'}
                `}
                style={{
                  borderColor: meta.highlight ? 'var(--accent)' : 'var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
              >
                <h2 className="text-xl font-semibold mb-1">{t(`pricing.${id}.name`)}</h2>
                <p className="text-sm opacity-80 mb-4">{t(`pricing.${id}.desc`)}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold">{meta.price}</span>
                  <span className="opacity-70">{t(`pricing.${id}.period`)}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {(Array.isArray(features) ? features : [features]).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span style={{ color: 'var(--accent)' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/"
                  className={`
                    block w-full py-2.5 text-center text-sm font-medium
                    ${meta.highlight ? '' : 'opacity-80 hover:opacity-100'}
                  `}
                  style={{
                    backgroundColor: meta.highlight ? 'var(--accent)' : 'transparent',
                    color: meta.highlight ? '#0f0f0f' : 'var(--text-primary)',
                    border: meta.highlight ? 'none' : '1px solid var(--border-color)',
                    borderRadius: isCozy ? '0.75rem' : 0,
                  }}
                >
                  {t(`pricing.${id}.cta`)}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm opacity-60 mt-8">
          <Link to="/" className="hover:opacity-100">{t('pricing.backHome')}</Link>
        </p>
      </div>
    </div>
  )
}
