import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()

  const handleClick = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh'
    changeLanguage(next)
  }

  return (
    <button
      onClick={handleClick}
      className="header-action"
      title={i18n.language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  )
}
