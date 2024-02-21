import { merge, cloneDeep } from 'lodash'
import en from './en/translation'
import esLa from './es-la/translation'
import fr from './fr/translation'
import ru from './ru/translation'

let translationOverrides

try {
  // eslint-disable-next-line global-require, import/no-unresolved, import/extensions
  translationOverrides = require('../../config/translationOverrides').default
} catch (error) {
  // ignore
}

const baseTranslations = {
  en,
  'es-LA': esLa,
  fr,
  'ru-RU': ru,
}

const resources = translationOverrides
  ? merge(cloneDeep(baseTranslations), translationOverrides.resources)
  : baseTranslations

const languagesLabels = [
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

export { resources, languagesLabels }
