import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { useStorage } from '../context/StorageContext'

const API_KEY_STORAGE = 'lightnode-api-key'

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || ''
}

export function setApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key)
}

export function SettingsModal({ onClose }) {
  const [apiKey, setApiKeyState] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('Qwen3-MAX')
  const { toast } = useToast()
  const { theme } = useTheme()
  const { resetAndReseed, isGuest } = useStorage()

  useEffect(() => {
    setApiKeyState(getApiKey())
    setBaseUrl(localStorage.getItem('lightnode-api-base') || 'https://api.openai.com/v1')
    setModel(localStorage.getItem('lightnode-api-model') || 'Qwen3-MAX')
  }, [])

  const handleSave = () => {
    setApiKey(apiKey)
    localStorage.setItem('lightnode-api-base', baseUrl)
    localStorage.setItem('lightnode-api-model', model)
    toast('API 配置已保存（仅存本地）', 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`w-full max-w-md p-6 shadow-xl ${theme === 'cozy' ? 'rounded-2xl' : 'rounded-lg'}`}
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">API 密钥配置</h2>
        <p className="text-sm mb-4 opacity-80">
          填入AI的API-key
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="Qwen3-MAX"
              className="w-full px-3 py-2 border bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKeyState(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>
        {isGuest && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <button
              onClick={() => {
                resetAndReseed()
                toast('已清空并重置为默认数据', 'success')
                onClose()
              }}
              className="px-4 py-2 text-sm opacity-80 hover:opacity-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              清空并重置为默认数据
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 opacity-70 hover:opacity-100">
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2"
            style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
