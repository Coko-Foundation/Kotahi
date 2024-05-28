/** Use this file as a template to override default translations.
 *  Default translations can be found in the packages/client/app/i18n folder.
 *
 *  You can override translations for individual groups, or for all groups
 *  universally (group-specific overrides take precedence over universal
 *  overrides, if the same translation key appears in both).
 *
 *  Create a separate version of this file for each group or universal override,
 *  insert your desired translation changes, and save to:
 *  - packages/client/config/translation/<groupName>/translationOverrides.js (AFFECTS ONE GROUP) or
 *  - packages/client/config/translation/translationOverrides.js (AFFECTS ALL GROUPS)
 */
const translationOverrides = {
  resources: {
    en: {
      translation: {
        /* Your changes here, to override packages/client/app/i18n/en/translation.js. EXAMPLE:

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
        /* Your changes here, to override packages/client/app/i18n/es-la/translation.js. */
      },
    },
    fr: {
      translation: {
        /* Your changes here, to override packages/client/app/i18n/fr/translation.js. */
      },
    },
    'ru-RU': {
      translation: {
        /* Your changes here, to override packages/client/app/i18n/ru/translation.js. */
      },
    },

    /* It is possible to add new languages here, that are not present in the packages/client/app/i18n folder.
    If you do, you must also register it in the languagesLabels section below.
    EXAMPLE adding the Occitan language:

    oc: {
      translation: {
        // Here you will need a complete set of translations
        // similar to those found in e.g. packages/client/app/i18n/fr/translation.js
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
