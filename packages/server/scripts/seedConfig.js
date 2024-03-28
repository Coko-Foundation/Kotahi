/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
const { Config } = require('@pubsweet/models')

const seedConfig = async (group, instanceName, index, options) => {
  const { trx } = options
  let config = {}

  const publishing =
    index === 0
      ? {
          hypothesis: {
            group: process.env.HYPOTHESIS_GROUP || null,
            apiKey: process.env.HYPOTHESIS_API_KEY || null,
            shouldAllowTagging: process.env.HYPOTHESIS_ALLOW_TAGGING === 'true',
            reverseFieldOrder:
              process.env.HYPOTHESIS_REVERSE_FIELD_ORDER === 'true',
          },
          webhook: {
            ref: process.env.PUBLISHING_WEBHOOK_REF || null,
            url: process.env.PUBLISHING_WEBHOOK_URL || null,
            token: process.env.PUBLISHING_WEBHOOK_TOKEN || null,
          },
          crossref: {
            login: process.env.CROSSREF_LOGIN || null,
            password: process.env.CROSSREF_PASSWORD || null,
            doiPrefix: process.env.DOI_PREFIX || null,
            licenseUrl: process.env.PUBLICATION_LICENSE_URL || null,
            registrant: process.env.CROSSREF_REGISTRANT || null,
            journalName: process.env.JOURNAL_NAME || null,
            depositorName: process.env.CROSSREF_DEPOSITOR_NAME || null,
            depositorEmail: process.env.CROSSREF_DEPOSITOR_EMAIL || null,
            journalHomepage: process.env.JOURNAL_HOMEPAGE || null,
            publicationType:
              process.env.CROSSREF_PUBLICATION_TYPE === 'article'
                ? 'article'
                : 'peer review',
            journalAbbreviatedName:
              process.env.JOURNAL_ABBREVIATED_NAME || null,
            publishedArticleLocationPrefix:
              process.env.PUBLISHED_ARTICLE_LOCATION_PREFIX || null,
            useSandbox: process.env.CROSSREF_USE_SANDBOX === 'true',
          },
        }
      : {
          hypothesis: {
            group: null,
            apiKey: null,
            shouldAllowTagging: false,
            reverseFieldOrder: false,
          },
          webhook: {
            ref: null,
            url: null,
            token: null,
          },
          crossref: {
            login: null,
            password: null,
            doiPrefix: null,
            licenseUrl: null,
            registrant: null,
            journalName: null,
            depositorName: null,
            depositorEmail: null,
            journalHomepage: null,
            publicationType: 'article',
            journalAbbreviatedName: null,
            publishedArticleLocationPrefix: null,
            useSandbox: false,
          },
        }

  const notification =
    index === 0
      ? {
          gmailAuthEmail: process.env.GMAIL_NOTIFICATION_EMAIL_AUTH || null,
          gmailSenderEmail: process.env.GMAIL_NOTIFICATION_EMAIL_SENDER || null,
          gmailAuthPassword: process.env.GMAIL_NOTIFICATION_PASSWORD || null,
        }
      : {
          gmailAuthEmail: null,
          gmailSenderEmail: null,
          gmailAuthPassword: null,
        }

  const groupIdentity = {
    brandName: group.name || 'Kotahi',
    primaryColor: '#3aae2a',
    secondaryColor: '#9e9e9e',
    logoPath: '/assets/logo-kotahi.png',
  }

  const kotahiApiTokens =
    index === 0 ? process.env.KOTAHI_API_TOKENS || null : null

  // Creates a config based on instance type one of "preprint1, preprint2, prc, journal" and "journal" being default
  switch (instanceName) {
    case 'preprint1':
      config = {
        active: true,
        formData: {
          instanceName: 'preprint1',
          user: {
            isAdmin: false,
          },
          report: { showInMenu: true },
          review: { showSummary: false },
          dashboard: { loginRedirectUrl: '/admin/manuscripts' },
          manuscript: {
            tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
            newSubmission: true,
            paginationCount: 10,
          },
          submission: {
            allowAuthorsSubmitNewVersion: false,
          },
          publishing,
          taskManager: {
            teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
          },
          controlPanel: {
            showTabs: ['Metadata'],
            displayManuscriptShortId: true,
            authorProofingEnabled: false,
          },
          notification,
          eventNotification: {},
          groupIdentity,
          kotahiApis: {},
        },
        type: 'Config',
      }
      break
    case 'preprint2':
      config = {
        active: true,
        formData: {
          instanceName: 'preprint2',
          user: {
            isAdmin: false,
          },
          report: { showInMenu: true },
          review: { showSummary: false },
          dashboard: {
            showSections: ['editor'],
            loginRedirectUrl: '/dashboard',
          },
          manuscript: {
            labelColumn: true,
            tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
            manualImport: process.env.ALLOW_MANUAL_IMPORT === 'true',
            newSubmission: true,
            paginationCount: 50,
          },
          submission: {
            allowAuthorsSubmitNewVersion: false,
          },
          publishing,
          taskManager: {
            teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
          },
          controlPanel: {
            showTabs: ['Metadata'],
            displayManuscriptShortId: true,
            authorProofingEnabled: false,
          },
          notification,
          eventNotification: {},
          groupIdentity,
          kotahiApis: {},
        },
        type: 'Config',
      }
      break
    case 'prc':
      config = {
        active: true,
        formData: {
          instanceName: 'prc',
          user: {
            isAdmin: false,
          },
          report: { showInMenu: true },
          review: { showSummary: true },
          dashboard: {
            showSections: ['submission', 'review', 'editor'],
            loginRedirectUrl: '/dashboard',
          },
          manuscript: {
            labelColumn: true,
            tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
            newSubmission: true,
            autoImportHourUtc: process.env.AUTO_IMPORT_HOUR_UTC
              ? Number(process.env.AUTO_IMPORT_HOUR_UTC)
              : 21,
            paginationCount: 10,
            archivePeriodDays: process.env.ARCHIVE_PERIOD_DAYS
              ? Number(process.env.ARCHIVE_PERIOD_DAYS)
              : 60,
            semanticScholarImportsRecencyPeriodDays: process.env
              .SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS
              ? Number(process.env.SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS)
              : 42,
          },
          submission: {
            allowAuthorsSubmitNewVersion: false,
          },
          publishing,
          taskManager: {
            teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
          },
          controlPanel: {
            showTabs: [
              'Team',
              'Decision',
              'Reviews',
              'Manuscript text',
              'Metadata',
              'Tasks & Notifications',
            ],
            hideReview: process.env.REVIEW_HIDE === 'true',
            sharedReview: process.env.REVIEW_SHARED === 'true',
            displayManuscriptShortId: true,
            authorProofingEnabled: false,
            editorsEditReviewsEnabled: false,
          },
          notification,
          eventNotification: {},
          groupIdentity,
          kotahiApis: {},
        },
        type: 'Config',
      }
      break
    case 'journal':
      config = {
        active: true,
        formData: {
          instanceName: 'journal',
          user: {
            isAdmin: false,
            kotahiApiTokens,
          },
          report: { showInMenu: true },
          review: { showSummary: false },
          dashboard: {
            showSections: ['submission', 'review', 'editor'],
            loginRedirectUrl: '/dashboard',
          },
          manuscript: {
            tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
            paginationCount: 10,
          },
          submission: {
            allowAuthorsSubmitNewVersion: false,
          },
          publishing,
          taskManager: {
            teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
          },
          controlPanel: {
            showTabs: [
              'Team',
              'Decision',
              'Reviews',
              'Manuscript text',
              'Metadata',
              'Tasks & Notifications',
            ],
            hideReview: process.env.REVIEW_HIDE === 'true',
            sharedReview: process.env.REVIEW_SHARED === 'true',
            displayManuscriptShortId: true,
            authorProofingEnabled: false,
            editorsEditReviewsEnabled: false,
          },
          notification,
          eventNotification: {},
          groupIdentity,
          kotahiApis: {},
        },
        type: 'Config',
      }
      break
    default:
      config = {
        active: true,
        formData: {
          instanceName: 'journal',
          user: {
            isAdmin: false,
          },
          report: { showInMenu: true },
          review: { showSummary: false },
          dashboard: {
            showSections: ['submission', 'review', 'editor'],
            loginRedirectUrl: '/dashboard',
          },
          manuscript: {
            tableColumns: process.env.MANUSCRIPTS_TABLE_COLUMNS,
            paginationCount: 10,
          },
          submission: {
            allowAuthorsSubmitNewVersion: false,
          },
          publishing,
          taskManager: {
            teamTimezone: process.env.TEAM_TIMEZONE || 'Etc/UTC',
          },
          controlPanel: {
            showTabs: [
              'Team',
              'Decision',
              'Reviews',
              'Manuscript text',
              'Metadata',
              'Tasks & Notifications',
            ],
            hideReview: process.env.REVIEW_HIDE === 'true',
            sharedReview: process.env.REVIEW_SHARED === 'true',
            displayManuscriptShortId: true,
            authorProofingEnabled: false,
            editorsEditReviewsEnabled: false,
          },
          notification,
          eventNotification: {},
          groupIdentity,
          kotahiApis: {},
        },
        type: 'Config',
      }
      break
  }

  config.groupId = group.id
  config.formData = JSON.stringify(config.formData)

  const configExists = await Config.query(trx).findOne({
    groupId: group.id,
    active: true,
  })

  let createdConfig = null

  if (!configExists) {
    createdConfig = await Config.query(trx).insertAndFetch(config)
    console.log(
      `    Added "${createdConfig.formData.instanceName}" instance type config to database for "${group.name}" group.`,
    )
  } else {
    console.log(
      `    "${configExists.formData.instanceName}" instance type config already exists in database for "${group.name}". Skipping.`,
    )
  }

  return createdConfig || configExists
}

module.exports = seedConfig
