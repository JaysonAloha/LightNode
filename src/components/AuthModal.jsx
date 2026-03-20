import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export function AuthModal({ onClose, mode = 'signin' }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(mode === 'signup')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast(t('auth.fillEmailPassword'), 'error')
      return
    }
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        toast(t('auth.signUpSuccess'), 'success')
      } else {
        await signIn(email, password)
        toast(t('auth.signInSuccess'), 'success')
        onClose()
      }
    } catch (err) {
      toast(err.message || t('auth.operationFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (err) {
      toast(err.message || t('auth.googleFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-lg font-semibold mb-4">
          {isSignUp ? t('auth.signUp') : t('auth.signIn')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 opacity-80">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-80">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border bg-transparent focus:outline-none focus:ring-1"
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: '#0f0f0f' }}
            >
              {loading ? t('auth.processing') : isSignUp ? t('auth.submitSignUp') : t('auth.submitSignIn')}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="px-4 py-2 opacity-70 hover:opacity-100 text-sm"
            >
              {isSignUp ? t('auth.toSignIn') : t('auth.toSignUp')}
            </button>
          </div>
        </form>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border hover:opacity-80 disabled:opacity-50"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.googleLogin')}
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm opacity-60 hover:opacity-100"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
