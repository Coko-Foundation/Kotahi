import { merge, cloneDeep } from 'lodash'
import en from './en/translation'
import esLa from './es-la/translation'
import fr from './fr/translation'
import ru from './ru/translation'

const loadGroupTranslationOverrides = groupName => {
  if (!groupName) return {}

  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(`../../config/translation/${groupName}/translationOverrides`)
      .default
  } catch (error) {
    return {}
  }
}

let globalOverrides = {}

try {
  globalOverrides =
    // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
    require('../../config/translation/translationOverrides').default
} catch (error) {
  // ignore
}

const baseTranslations = {
  en,
  'es-LA': esLa,
  fr,
  'ru-RU': ru,
}

/** Translation overrides can be supplied per group and/or globally (for all groups).
 * Group-specific overrides take precedence, where there are conflicts.
 */
const getTranslationOverrides = groupName => {
  const groupOverrides = loadGroupTranslationOverrides(groupName)
  const combinedOverrides = merge(cloneDeep(globalOverrides), groupOverrides)
  if (Object.keys(combinedOverrides).length) return combinedOverrides
  return null
}

const getResources = groupName => {
  const translationOverrides = getTranslationOverrides(groupName)
  if (!translationOverrides) return baseTranslations
  return merge(cloneDeep(baseTranslations), translationOverrides.resources)
}

const getLanguagesLabels = groupName => {
  const translationOverrides = getTranslationOverrides(groupName)

  return [
    { value: 'en', label: 'English' },
    { value: 'es-LA', label: 'Español Latinoamericano' },
    { value: 'fr', label: 'Français' },
    {
      value: 'ru-RU',
      label: 'Русский',
      monthAbbrevs: [
        'Янв',
        'Февр',
        'Март',
        'Апр',
        'Май',
        'Июнь',
        'Июль',
        'Авг',
        'Сент',
        'Окт',
        'Нояб',
        'Дек',
      ],
      dateFormat: 'dd.MM.yyyy',
      funcs: {
        formatDate: (date, time = false, withSeconds = true) => {
          let newDate = date

          if (typeof date !== 'object') {
            newDate = new Date(date)
          }

          let dateStr = newDate.toLocaleDateString('ru-RU')

          if (time) dateStr += ` ${newDate.toLocaleTimeString('ru-RU')}`

          if (!!time && !withSeconds)
            dateStr = dateStr.substring(0, dateStr.length - 3)

          return dateStr
        },
        convertTimestampToDateString: (date, month, pad) => {
          const day = date.getDate()
          const year = date.getFullYear()
          const hours = date.getHours()
          const minutes = date.getMinutes()
          return `${day} ${month} ${year} ${pad(hours)}:${minutes}`
        },
        convertTimestampToDateWithoutTimeString: (date, month) => {
          const day = date.getDate()
          const year = date.getFullYear()
          return `${day} ${month} ${year}`
        },
      },
    },
    ...(translationOverrides?.languagesLabels ?? []),
  ]
}

export { getResources, getLanguagesLabels }
