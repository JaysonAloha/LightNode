import { useUiPreferences } from '../../store/uiPreferencesStore'
import { useTranslation } from 'react-i18next'

export function AIStudioPresetList({ onSelect }) {
  const { t } = useTranslation()
  const { presets, history, loadPreset, restoreFromHistory } = useUiPreferences()

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs opacity-60 mb-2">{t('aiStudio.historyVersions')}</p>
        {history.length === 0 ? (
          <p className="text-xs opacity-50">{t('aiStudio.noHistory')}</p>
        ) : (
          <div className="space-y-1">
            {history.slice(0, 5).map((h, i) => (
              <button
                key={h.ts}
                onClick={() => {
                  restoreFromHistory(i)
                  onSelect?.()
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('aiStudio.version', { n: i + 1 })} · {new Date(h.ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs opacity-60 mb-2">{t('aiStudio.myPresets')}</p>
        {presets.length === 0 ? (
          <p className="text-xs opacity-50">{t('aiStudio.noPresets')}</p>
        ) : (
          presets.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-black/5 group"
            >
              <button
                onClick={() => {
                  loadPreset(p.id)
                  onSelect?.(p.config)
                }}
                className="flex-1 text-left text-sm truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {p.name}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
