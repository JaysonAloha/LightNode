import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../i18n'

export function LanguageToggle() {
  const { t, i18n } = useTranslation()

  const handleClick = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh'
    changeLanguage(next)
  }

  return (
    <button
      onClick={handleClick}
      className="header-action"
      title={i18n.language === 'zh' ? t('lang.switchToEn') : t('lang.switchToZh')}
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  )
}
