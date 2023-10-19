import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import i18next from 'i18next'
import { resources } from './i18n/index'
import { russianPluralRule } from './i18nfuncs'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    debug: false,
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: true, // escaping is already in React, so disable it
    },
    detection: {
      order: ['navigator'],
    },
  })
  .then(() => {
    i18next.services.pluralResolver.addRule('ru', russianPluralRule)
  })

export default i18next
