import { useUiPreferences } from '../../store/uiPreferencesStore'
import { useTranslation } from 'react-i18next'

const WIDGET_KEYS = {
  welcome: 'widgetWelcome',
  search: 'widgetSearch',
  'recent-notes': 'widgetRecentNotes',
  'daily-review': 'widgetDailyReview',
  timeline: 'widgetTimeline',
  'ai-widget': 'widgetAi',
  map: 'widgetMap',
  weather: 'widgetWeather',
}

export function AIStudioPreviewPanel({ config }) {
  const { t } = useTranslation()
  const cfg = config || {}
  const widgets = cfg.homepageWidgets || ['welcome', 'search', 'recent-notes', 'daily-review', 'ai-widget']
  const showMap = cfg.showMap ?? false

  return (
    <div
      className="h-full overflow-y-auto p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-md mx-auto space-y-3">
        {widgets.map((w) => (
          <div
            key={w}
            className="p-3 rounded-lg border transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              borderRadius: cfg.borderRadius === 'round' ? '1rem' : cfg.borderRadius === 'sharp' ? 0 : '0.5rem',
            }}
          >
            <span className="text-xs opacity-60">{WIDGET_KEYS[w] ? t(`aiStudio.${WIDGET_KEYS[w]}`) : w}</span>
            <div className="mt-1 h-8 bg-black/5 rounded" style={{ opacity: 0.6 }} />
          </div>
        ))}
        {showMap && (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <span className="text-xs opacity-60">{t('aiStudio.widgetMap')}</span>
            <div className="mt-1 h-20 bg-black/5 rounded flex items-center justify-center text-xs opacity-50">
              {t('aiStudio.mapPlaceholder')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
