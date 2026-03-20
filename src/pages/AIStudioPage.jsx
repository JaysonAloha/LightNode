import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiPreferences } from '../store/uiPreferencesStore'
import { useSubscription } from '../context/SubscriptionContext'
import { useToast } from '../context/ToastContext'
import { chatWithAI } from '../services/ai/aiStudioService'
import { AIStudioChatPanel } from '../components/ai-studio/AIStudioChatPanel'
import { AIStudioPreviewPanel } from '../components/ai-studio/AIStudioPreviewPanel'
import { AIStudioPresetList } from '../components/ai-studio/AIStudioPresetList'
import { AIStudioUpgradeCard } from '../components/ai-studio/AIStudioUpgradeCard'
import { AIStudioConfigInspector } from '../components/ai-studio/AIStudioConfigInspector'

const MOCK_TRIAL_LIMIT = 2

export function AIStudioPage() {
  const { config, applyConfig, undo, resetToDefault, savePreset } = useUiPreferences()
  const { canUseAIStudio } = useSubscription()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [mockTrialCount, setMockTrialCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lightnode-ai-studio-trial') || '0', 10)
    } catch { return 0 }
  })
  const [hasStartedTrial, setHasStartedTrial] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showPresetInput, setShowPresetInput] = useState(false)

  const isMax = canUseAIStudio?.() ?? false
  const canChat = isMax || mockTrialCount < MOCK_TRIAL_LIMIT
  const exceededTrial = !isMax && mockTrialCount >= MOCK_TRIAL_LIMIT

  const handleSend = useCallback(
    async (content) => {
      if (!canChat) return

      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'user', content },
      ])
      setLoading(true)

      try {
        const result = await chatWithAI(content, config, {
          onChunk: (chunk) => {
            setMessages((m) => {
              const last = m[m.length - 1]
              if (last?.role === 'assistant' && !last.final) {
                return [
                  ...m.slice(0, -1),
                  { ...last, content: last.content + chunk },
                ]
              }
              return [
                ...m,
                {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: chunk,
                  final: false,
                },
              ]
            })
          },
          onDone: (res) => {
            setMessages((m) => {
              const withoutStreaming = m.filter((x) => !(x.role === 'assistant' && !x.final))
              return [
                ...withoutStreaming,
                {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: res.explanation,
                  suggestions: res.optional_suggestions,
                  final: true,
                },
              ]
            })
          },
        })

        if (result?.ui_config && Object.keys(result.ui_config).length > 0) {
          applyConfig(result.ui_config)
          toast(t('aiStudio.configApplied'), 'success')
        }

        if (!isMax) {
          const next = mockTrialCount + 1
          setMockTrialCount(next)
          localStorage.setItem('lightnode-ai-studio-trial', String(next))
        }
      } catch (e) {
        toast(e.message || t('aiStudio.requestFailed'), 'error')
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: t('aiStudio.retryError'),
            final: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [config, canChat, isMax, applyConfig, toast, t]
  )

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim())
      toast(t('aiStudio.presetSaved'), 'success')
      setPresetName('')
      setShowPresetInput(false)
    }
  }

  const handleUndo = () => {
    const prev = undo()
    if (prev) toast(t('aiStudio.undoSuccess'), 'success')
  }

  if (!isMax && !hasStartedTrial && messages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <AIStudioUpgradeCard />
        <p className="mt-6 text-sm opacity-60">
          {t('aiStudio.upgradeOrTrial')}
        </p>
        <button
          onClick={() => setHasStartedTrial(true)}
          className="mt-4 px-6 py-2 text-sm"
          style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
        >
          {t('aiStudio.startTrial')}
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          {!isMax && (
            <span className="text-sm opacity-60">
              {t('aiStudio.trialCount', { current: mockTrialCount, limit: MOCK_TRIAL_LIMIT })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('aiStudio.undo')}
          </button>
          <button
            onClick={() => {
              resetToDefault()
              toast(t('aiStudio.resetSuccess'), 'success')
            }}
            className="px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('aiStudio.resetDefault')}
          </button>
          {showPresetInput ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('aiStudio.presetName')}
                className="w-24 px-2 py-1 text-sm bg-transparent border"
                style={{ borderColor: 'var(--border-color)' }}
              />
              <button
                onClick={handleSavePreset}
                className="px-2 py-1 text-sm"
                style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
              >
                {t('common.save')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPresetInput(true)}
              className="px-3 py-1.5 text-sm"
              style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
            >
              {t('aiStudio.savePreset')}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div
          className="lg:col-span-2 flex flex-col rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <AIStudioChatPanel
            messages={messages}
            onSend={handleSend}
            loading={loading}
            disabled={exceededTrial}
            placeholder={
              exceededTrial
                ? t('aiStudio.trialExceeded')
                : t('aiStudio.placeholder')
            }
          />
        </div>
        <div className="flex flex-col gap-4 min-h-0">
          <div
            className="flex-1 rounded-lg border overflow-hidden min-h-[200px]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <p className="text-xs px-4 py-2 opacity-60 border-b" style={{ borderColor: 'var(--border-color)' }}>
              {t('aiStudio.livePreview')}
            </p>
            <div className="h-[calc(100%-2.5rem)]">
              <AIStudioPreviewPanel config={config} />
            </div>
          </div>
          <AIStudioConfigInspector config={config} onApply={applyConfig} />
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
          >
            <AIStudioPresetList onSelect={() => {}} />
          </div>
        </div>
      </div>

      {exceededTrial && (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <AIStudioUpgradeCard />
        </div>
      )}
    </div>
  )
}
