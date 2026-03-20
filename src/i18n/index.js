import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import zh from '../locales/zh.json'
import en from '../locales/en.json'

const LANGUAGE_STORAGE_KEY = 'lightnode-language'

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {}
  return 'zh'
}

export function initI18n() {
  const lng = getInitialLanguage()
  i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'zh',
    supportedLngs: ['zh', 'en'],
    interpolation: { escapeValue: false },
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
  })
  return lng
}

export function changeLanguage(lng) {
  if (lng !== 'zh' && lng !== 'en') return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {}
  i18n.changeLanguage(lng)
}

export function getStoredLanguage() {
  return getInitialLanguage()
}

export function useLanguage() {
  const { i18n } = useTranslation()
  return {
    language: i18n.language === 'en' ? 'en' : 'zh',
    changeLanguage,
  }
}
