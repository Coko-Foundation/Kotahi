/** Use this structure to override translations in the various translation files
 *  under the app/i18n folder. This file should be named config/translationOverrides.js */
const translationOverrides = {
  resources: {
    en: {
      translation: {
        /* Your changes here, to override app/i18n/en/translation.js. EXAMPLE:

        msStatus: {
          accepted: 'Approved',
        },
        manuscriptsTable: {
          'Manuscript number': 'Preprint number',
        },

        */
      },
    },
    'es-LA': {
      translation: {
        /* Your changes here, to override app/i18n/es-la/translation.js. */
      },
    },
    fr: {
      translation: {
        /* Your changes here, to override app/i18n/fr/translation.js. */
      },
    },
    'ru-RU': {
      translation: {
        /* Your changes here, to override app/i18n/ru/translation.js. */
      },
    },

    /* It is possible to add new languages here, that are not present in the app/i18n folder.
    If you do, you must also register it in the languagesLabels section below.
    EXAMPLE adding the Occitan language:

    oc: {
      translation: {
        // Here you will need a complete set of translations
        // similar to those found in e.g. app/i18n/fr/translation.js
      },
    },

    */
  },
  languagesLabels: [
    /* If you add new languages above, you must register them here. EXAMPLE:

    { value: 'oc', label: 'Occitan' },

    */
  ],
}

export default translationOverrides
