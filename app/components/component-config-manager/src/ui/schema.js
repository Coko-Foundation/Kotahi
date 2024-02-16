/* eslint-disable no-unused-vars */
import React from 'react'
import BrandIcon from './BrandIcon'

const generateSchema = (
  emailNotificationOptions,
  setLogoId,
  setFavicon,
  deleteFile,
  createFile,
  config,
  defaultReviewerInvitationTemplate,
  defaultAuthorProofingInvitationTemplate,
  defaultAuthorProofingSubmittedTemplate,
  t,
) => {
  const schema = {
    definitions: {
      timezones: {
        type: 'string',
        enum: [
          'Africa/Abidjan',
          'Africa/Accra',
          'Africa/Algiers',
          'Africa/Bissau',
          'Africa/Cairo',
          'Africa/Casablanca',
          'Africa/Ceuta',
          'Africa/El_Aaiun',
          'Africa/Johannesburg',
          'Africa/Juba',
          'Africa/Khartoum',
          'Africa/Lagos',
          'Africa/Maputo',
          'Africa/Monrovia',
          'Africa/Nairobi',
          'Africa/Ndjamena',
          'Africa/Sao_Tome',
          'Africa/Tripoli',
          'Africa/Tunis',
          'Africa/Windhoek',
          'America/Adak',
          'America/Anchorage',
          'America/Araguaina',
          'America/Argentina/Buenos_Aires',
          'America/Argentina/Catamarca',
          'America/Argentina/Cordoba',
          'America/Argentina/Jujuy',
          'America/Argentina/La_Rioja',
          'America/Argentina/Mendoza',
          'America/Argentina/Rio_Gallegos',
          'America/Argentina/Salta',
          'America/Argentina/San_Juan',
          'America/Argentina/San_Luis',
          'America/Argentina/Tucuman',
          'America/Argentina/Ushuaia',
          'America/Asuncion',
          'America/Atikokan',
          'America/Bahia',
          'America/Bahia_Banderas',
          'America/Barbados',
          'America/Belem',
          'America/Belize',
          'America/Blanc-Sablon',
          'America/Boa_Vista',
          'America/Bogota',
          'America/Boise',
          'America/Cambridge_Bay',
          'America/Campo_Grande',
          'America/Cancun',
          'America/Caracas',
          'America/Cayenne',
          'America/Chicago',
          'America/Chihuahua',
          'America/Costa_Rica',
          'America/Creston',
          'America/Cuiaba',
          'America/Curacao',
          'America/Danmarkshavn',
          'America/Dawson',
          'America/Dawson_Creek',
          'America/Denver',
          'America/Detroit',
          'America/Edmonton',
          'America/Eirunepe',
          'America/El_Salvador',
          'America/Fort_Nelson',
          'America/Fortaleza',
          'America/Glace_Bay',
          'America/Goose_Bay',
          'America/Grand_Turk',
          'America/Guatemala',
          'America/Guayaquil',
          'America/Guyana',
          'America/Halifax',
          'America/Havana',
          'America/Hermosillo',
          'America/Indiana/Indianapolis',
          'America/Indiana/Knox',
          'America/Indiana/Marengo',
          'America/Indiana/Petersburg',
          'America/Indiana/Tell_City',
          'America/Indiana/Vevay',
          'America/Indiana/Vincennes',
          'America/Indiana/Winamac',
          'America/Inuvik',
          'America/Iqaluit',
          'America/Jamaica',
          'America/Juneau',
          'America/Kentucky/Louisville',
          'America/Kentucky/Monticello',
          'America/La_Paz',
          'America/Lima',
          'America/Los_Angeles',
          'America/Maceio',
          'America/Managua',
          'America/Manaus',
          'America/Martinique',
          'America/Matamoros',
          'America/Mazatlan',
          'America/Menominee',
          'America/Merida',
          'America/Metlakatla',
          'America/Mexico_City',
          'America/Miquelon',
          'America/Moncton',
          'America/Monterrey',
          'America/Montevideo',
          'America/Nassau',
          'America/New_York',
          'America/Nipigon',
          'America/Nome',
          'America/Noronha',
          'America/North_Dakota/Beulah',
          'America/North_Dakota/Center',
          'America/North_Dakota/New_Salem',
          'America/Nuuk',
          'America/Ojinaga',
          'America/Panama',
          'America/Pangnirtung',
          'America/Paramaribo',
          'America/Phoenix',
          'America/Port-au-Prince',
          'America/Port_of_Spain',
          'America/Porto_Velho',
          'America/Puerto_Rico',
          'America/Punta_Arenas',
          'America/Rainy_River',
          'America/Rankin_Inlet',
          'America/Recife',
          'America/Regina',
          'America/Resolute',
          'America/Rio_Branco',
          'America/Santarem',
          'America/Santiago',
          'America/Santo_Domingo',
          'America/Sao_Paulo',
          'America/Scoresbysund',
          'America/Sitka',
          'America/St_Johns',
          'America/Swift_Current',
          'America/Tegucigalpa',
          'America/Thule',
          'America/Thunder_Bay',
          'America/Tijuana',
          'America/Toronto',
          'America/Vancouver',
          'America/Whitehorse',
          'America/Winnipeg',
          'America/Yakutat',
          'America/Yellowknife',
          'Antarctica/Casey',
          'Antarctica/Davis',
          'Antarctica/DumontDUrville',
          'Antarctica/Macquarie',
          'Antarctica/Mawson',
          'Antarctica/Palmer',
          'Antarctica/Rothera',
          'Antarctica/Syowa',
          'Antarctica/Troll',
          'Antarctica/Vostok',
          'Asia/Almaty',
          'Asia/Amman',
          'Asia/Anadyr',
          'Asia/Aqtau',
          'Asia/Aqtobe',
          'Asia/Ashgabat',
          'Asia/Atyrau',
          'Asia/Baghdad',
          'Asia/Baku',
          'Asia/Bangkok',
          'Asia/Barnaul',
          'Asia/Beirut',
          'Asia/Bishkek',
          'Asia/Brunei',
          'Asia/Chita',
          'Asia/Choibalsan',
          'Asia/Colombo',
          'Asia/Damascus',
          'Asia/Dhaka',
          'Asia/Dili',
          'Asia/Dubai',
          'Asia/Dushanbe',
          'Asia/Famagusta',
          'Asia/Gaza',
          'Asia/Hebron',
          'Asia/Ho_Chi_Minh',
          'Asia/Hong_Kong',
          'Asia/Hovd',
          'Asia/Irkutsk',
          'Asia/Jakarta',
          'Asia/Jayapura',
          'Asia/Jerusalem',
          'Asia/Kabul',
          'Asia/Kamchatka',
          'Asia/Karachi',
          'Asia/Kathmandu',
          'Asia/Khandyga',
          'Asia/Kolkata',
          'Asia/Krasnoyarsk',
          'Asia/Kuala_Lumpur',
          'Asia/Kuching',
          'Asia/Macau',
          'Asia/Magadan',
          'Asia/Makassar',
          'Asia/Manila',
          'Asia/Nicosia',
          'Asia/Novokuznetsk',
          'Asia/Novosibirsk',
          'Asia/Omsk',
          'Asia/Oral',
          'Asia/Pontianak',
          'Asia/Pyongyang',
          'Asia/Qatar',
          'Asia/Qostanay',
          'Asia/Qyzylorda',
          'Asia/Riyadh',
          'Asia/Sakhalin',
          'Asia/Samarkand',
          'Asia/Seoul',
          'Asia/Shanghai',
          'Asia/Singapore',
          'Asia/Srednekolymsk',
          'Asia/Taipei',
          'Asia/Tashkent',
          'Asia/Tbilisi',
          'Asia/Tehran',
          'Asia/Thimphu',
          'Asia/Tokyo',
          'Asia/Tomsk',
          'Asia/Ulaanbaatar',
          'Asia/Urumqi',
          'Asia/Ust-Nera',
          'Asia/Vladivostok',
          'Asia/Yakutsk',
          'Asia/Yangon',
          'Asia/Yekaterinburg',
          'Asia/Yerevan',
          'Atlantic/Azores',
          'Atlantic/Bermuda',
          'Atlantic/Canary',
          'Atlantic/Cape_Verde',
          'Atlantic/Faroe',
          'Atlantic/Madeira',
          'Atlantic/Reykjavik',
          'Atlantic/South_Georgia',
          'Atlantic/Stanley',
          'Australia/Adelaide',
          'Australia/Brisbane',
          'Australia/Broken_Hill',
          'Australia/Darwin',
          'Australia/Eucla',
          'Australia/Hobart',
          'Australia/Lindeman',
          'Australia/Lord_Howe',
          'Australia/Melbourne',
          'Australia/Perth',
          'Australia/Sydney',
          'CET',
          'CST6CDT',
          'EET',
          'EST',
          'EST5EDT',
          'Etc/GMT',
          'Etc/GMT+1',
          'Etc/GMT+10',
          'Etc/GMT+11',
          'Etc/GMT+12',
          'Etc/GMT+2',
          'Etc/GMT+3',
          'Etc/GMT+4',
          'Etc/GMT+5',
          'Etc/GMT+6',
          'Etc/GMT+7',
          'Etc/GMT+8',
          'Etc/GMT+9',
          'Etc/GMT-1',
          'Etc/GMT-10',
          'Etc/GMT-11',
          'Etc/GMT-12',
          'Etc/GMT-13',
          'Etc/GMT-14',
          'Etc/GMT-2',
          'Etc/GMT-3',
          'Etc/GMT-4',
          'Etc/GMT-5',
          'Etc/GMT-6',
          'Etc/GMT-7',
          'Etc/GMT-8',
          'Etc/GMT-9',
          'Etc/UTC',
          'Europe/Amsterdam',
          'Europe/Andorra',
          'Europe/Astrakhan',
          'Europe/Athens',
          'Europe/Belgrade',
          'Europe/Berlin',
          'Europe/Brussels',
          'Europe/Bucharest',
          'Europe/Budapest',
          'Europe/Chisinau',
          'Europe/Copenhagen',
          'Europe/Dublin',
          'Europe/Gibraltar',
          'Europe/Helsinki',
          'Europe/Istanbul',
          'Europe/Kaliningrad',
          'Europe/Kiev',
          'Europe/Kirov',
          'Europe/Lisbon',
          'Europe/London',
          'Europe/Luxembourg',
          'Europe/Madrid',
          'Europe/Malta',
          'Europe/Minsk',
          'Europe/Monaco',
          'Europe/Moscow',
          'Europe/Oslo',
          'Europe/Paris',
          'Europe/Prague',
          'Europe/Riga',
          'Europe/Rome',
          'Europe/Samara',
          'Europe/Saratov',
          'Europe/Simferopol',
          'Europe/Sofia',
          'Europe/Stockholm',
          'Europe/Tallinn',
          'Europe/Tirane',
          'Europe/Ulyanovsk',
          'Europe/Uzhgorod',
          'Europe/Vienna',
          'Europe/Vilnius',
          'Europe/Volgograd',
          'Europe/Warsaw',
          'Europe/Zaporozhye',
          'Europe/Zurich',
          'HST',
          'Indian/Chagos',
          'Indian/Christmas',
          'Indian/Cocos',
          'Indian/Kerguelen',
          'Indian/Mahe',
          'Indian/Maldives',
          'Indian/Mauritius',
          'Indian/Reunion',
          'MET',
          'MST',
          'MST7MDT',
          'PST8PDT',
          'Pacific/Apia',
          'Pacific/Auckland',
          'Pacific/Bougainville',
          'Pacific/Chatham',
          'Pacific/Chuuk',
          'Pacific/Easter',
          'Pacific/Efate',
          'Pacific/Enderbury',
          'Pacific/Fakaofo',
          'Pacific/Fiji',
          'Pacific/Funafuti',
          'Pacific/Galapagos',
          'Pacific/Gambier',
          'Pacific/Guadalcanal',
          'Pacific/Guam',
          'Pacific/Honolulu',
          'Pacific/Kiritimati',
          'Pacific/Kosrae',
          'Pacific/Kwajalein',
          'Pacific/Majuro',
          'Pacific/Marquesas',
          'Pacific/Nauru',
          'Pacific/Niue',
          'Pacific/Norfolk',
          'Pacific/Noumea',
          'Pacific/Pago_Pago',
          'Pacific/Palau',
          'Pacific/Pitcairn',
          'Pacific/Pohnpei',
          'Pacific/Port_Moresby',
          'Pacific/Rarotonga',
          'Pacific/Tahiti',
          'Pacific/Tarawa',
          'Pacific/Tongatapu',
          'Pacific/Wake',
          'Pacific/Wallis',
          'WET',
        ],
      },
      hours: {
        type: 'integer',
        enum: [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
        ],
      },
    },
    type: 'object',
    title: t('configPage.Instance Type'),
    properties: {
      instanceName: {
        type: 'string',
        enum: ['preprint1', 'preprint2', 'prc', 'journal'],
        default: 'journal',
      },
    },
    required: ['instanceName'],
    dependencies: {
      instanceName: {
        oneOf: [
          {
            properties: {
              instanceName: {
                enum: ['preprint1'],
              },
              groupIdentity: {
                type: 'object',
                title: t('configPage.Group Identity'),
                properties: {
                  brandName: {
                    type: 'string',
                    description: t('configPage.Brand name'),
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: t('configPage.Brand primary colour'),
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: t('configPage.Brand secondary colour'),
                    default: '#9e9e9e',
                  },
                  // Default logo
                  logoPath: {
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                  logoId: {
                    description: t('configPage.Logo'),
                    type: ['string', 'null'],
                  },

                  favicon: {
                    description: t('configPage.Favicon'),
                    type: ['string', 'null'],
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: t('configPage.Dashboard'),
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description: t('configPage.landingPage'),
                    default: '/admin/manuscripts',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: t('configPage.Dashboard Page'),
                      },
                      {
                        const: '/admin/manuscripts',
                        title: t('configPage.Manuscript Page'),
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: t('configPage.pagesVisibleToRegistered'),
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: t('configPage.My Submissions'),
                        },
                        {
                          const: 'review',
                          title: t('configPage.To Review'),
                        },
                        {
                          const: 'editor',
                          title: t("configPage.Manuscripts I'm editor of"),
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: t('configPage.Manuscripts page'),
                properties: {
                  tableColumns: {
                    type: 'string',
                    description: t(
                      'configPage.List columns to display on the Manuscripts page',
                    ),
                    default:
                      'shortId, titleAndAbstract, created, updated, status, submission.$customStatus, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description: t('configPage.numberOfManuscripts'),
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description: t('configPage.hourManuscriptsImported'),
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description: t('configPage.daysManuscriptRemain'),
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description: t('configPage.importFromSematic'),
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title: t('configPage.newSubmissionActionVisisble'),
                    default: true,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title: t('configPage.displayActionToSelect'),
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title: t('configPage.importManuscriptsManually'),
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: t('configPage.Control panel'),
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: t('configPage.Display manuscript short id'),
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: t('configPage.Reviewers can see submitted reviews'),
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: t(
                      'configPage.Authors can see individual peer reviews',
                    ),
                    default: false,
                  },
                  authorProofingEnabled: {
                    type: 'boolean',
                    title: t('configPage.Author proofing enabled'),
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: t(
                      'configPage.Control pages visible to editors',
                    ),
                    minItems: 1,
                    default: ['Metadata'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Team',
                          title: t('configPage.showTabs.Team'),
                        },
                        {
                          const: 'Decision',
                          title: t('configPage.showTabs.Decision'),
                        },
                        {
                          const: 'Manuscript text',
                          title: t('configPage.showTabs.Manuscript text'),
                        },
                        {
                          const: 'Metadata',
                          title: t('configPage.showTabs.Metadata'),
                        },
                        {
                          const: 'Tasks & Notifications',
                          title: t('configPage.showTabs.Tasks & Notifications'),
                        },
                      ],
                      // enum: [
                      //   'Team',
                      //   'Decision',
                      //   'Manuscript text',
                      //   'Metadata',
                      //   'Tasks & Notifications',
                      // ],
                    },
                    uniqueItems: true,
                  }, // TODO: discuss more on this hiding features and refactor
                  // showFeatures: {
                  //   type: 'array',
                  //   description: 'Control page features visible to editors',
                  //   minItems: 1,
                  //   default: [
                  //     'Assign Editors',
                  //     'Reviews',
                  //     'Decision',
                  //     'Publish',
                  //   ],
                  //   items: {
                  //     type: 'string',
                  //     enum: [
                  //       'Assign Editors',
                  //       'Reviews',
                  //       'Decision',
                  //       'Publish',
                  //     ],
                  //   },
                  //   uniqueItems: true,
                  // },
                },
              },
              submission: {
                type: 'object',
                title: t('configPage.Submission'),
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title: t('configPage.allowToSubmitNewVersion'),
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: t('configPage.Review page'),
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: t('configPage.showSummary'),
                    default: false,
                  },
                },
              },
              production: {
                type: 'object',
                title: t('configPage.production.Production'),
                properties: {
                  crossrefRetrievalEmail: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Email to use for citation search',
                    ),
                    default: '',
                  },
                  crossrefSearchResultCount: {
                    type: 'number',
                    description: t(
                      'configPage.production.Number of results to return from citation search',
                    ),
                    default: 3,
                  },
                  styleName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select style formatting for citations',
                    ),
                    oneOf: [
                      {
                        const: 'apa',
                        title: t('configPage.production.apa'),
                      },
                      {
                        const: 'chicago-note-bibliography',
                        title: t('configPage.production.cmos'),
                      },
                      {
                        const: 'council-of-science-editors-alphabetical',
                        title: t('configPage.production.cse'),
                      },
                    ],
                    default: 'apa',
                  },
                  localeName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select locale for citations',
                    ),
                    enum: ['en-US', 'en-GB'],
                    default: 'en-US',
                  },
                },
              },

              publishing: {
                type: 'object',
                title: t('configPage.Publishing'),
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: t('configPage.Hypothesis'),
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis API key'),
                      },
                      group: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis group id'),
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: t('configPage.shouldAllowTagging'),
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title: t('configPage.reverseFieldOrder'),
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: t('configPage.Crossref'),
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalName'),
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalAbbreviatedName'),
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: t('configPage.journalHomepage'),
                      },
                      login: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefLogin'),
                      },
                      password: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefPassword'),
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefRegistrant'),
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorName'),
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorEmail'),
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: t('configPage.publicationType'),
                        // enum: ['article', 'peer review'],
                        default: 'peer review',
                        oneOf: [
                          {
                            const: 'article',
                            title: t('configPage.article'),
                          },
                          {
                            const: 'peer review',
                            title: t('configPage.peer review'),
                          },
                        ],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: t('configPage.doiPrefix'),
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: t(
                          'configPage.publishedArticleLocationPrefix',
                        ),
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: t('configPage.licenseUrl'),
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: t('configPage.useSandbox'),
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: t('configPage.Webhook'),
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookUrl'),
                      },
                      token: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookToken'),
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookRef'),
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: t('configPage.Task Manager'),
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: t('configPage.teamTimezone'),
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: t('configPage.Emails'),
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthEmail'),
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailSenderEmail'),
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthPassword'),
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: t('configPage.eventNotification'),
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description: t(
                      'configPage.reviewerInvitationPrimaryEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationTemplate.const,
                  },
                  authorProofingInvitationEmailTemplate: {
                    description: t(
                      'configPage.authorProofingInvitationEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingInvitationTemplate.const,
                  },
                  authorProofingSubmittedEmailTemplate: {
                    description: t(
                      'configPage.authorProofingSubmittedEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingSubmittedTemplate.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description: t(
                      'configPage.alertUnreadMessageDigestTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  mentionNotificationTemplate: {
                    description:
                      'Immediate Notification for users @mentioned in a message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: t('configPage.Reports'),
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: t('configPage.reportShowInMenu'),
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: t('configPage.User Management'),
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title: t('configPage.userIsAdmin'),
                    default: false,
                  },
                },
              },
              kotahiApis: {
                type: 'object',
                title: t('configPage.kotahiApis'),
                properties: {
                  tokens: {
                    type: ['string', 'null'],
                    description: t('configPage.tokens'),
                  },
                },
              },
              coarNotify: {
                type: 'object',
                title: t('configPage.api'),
                properties: {
                  repoIpAddress: {
                    type: ['string', 'null'],
                    description: t('configPage.allowedIPs'),
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['preprint2'],
              },
              groupIdentity: {
                type: 'object',
                title: t('configPage.Group Identity'),
                properties: {
                  brandName: {
                    type: 'string',
                    description: t('configPage.Brand name'),
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: t('configPage.Brand primary colour'),
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: t('configPage.Brand secondary colour'),
                    default: '#9e9e9e',
                  },
                  // Default logo
                  logoPath: {
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                  logoId: {
                    description: t('configPage.Logo'),
                    type: ['string', 'null'],
                  },
                  favicon: {
                    description: t('configPage.Favicon'),
                    type: ['string', 'null'],
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: t('configPage.Dashboard'),
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description: t('configPage.landingPage'),
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: t('configPage.Dashboard Page'),
                      },
                      {
                        const: '/admin/manuscripts',
                        title: t('configPage.Manuscript Page'),
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: t('configPage.pagesVisibleToRegistered'),
                    minItems: 1,
                    default: ['editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: t('configPage.My Submissions'),
                        },
                        {
                          const: 'review',
                          title: t('configPage.To Review'),
                        },
                        {
                          const: 'editor',
                          title: t("configPage.Manuscripts I'm editor of"),
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: t('configPage.Manuscripts page'),
                properties: {
                  tableColumns: {
                    type: 'string',
                    description: t(
                      'configPage.List columns to display on the Manuscripts page',
                    ),
                    default:
                      'shortId, titleAndAbstract, created, updated, status, submission.$customStatus, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description: t('configPage.numberOfManuscripts'),
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description: t('configPage.hourManuscriptsImported'),
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description: t('configPage.daysManuscriptRemain'),
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description: t('configPage.importFromSematic'),
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title: t('configPage.newSubmissionActionVisisble'),
                    default: true,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title: t('configPage.displayActionToSelect'),
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title: t('configPage.importManuscriptsManually'),
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: t('configPage.Control panel'),
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: t('configPage.Display manuscript short id'),
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: t('configPage.Reviewers can see submitted reviews'),
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: t(
                      'configPage.Authors can see individual peer reviews',
                    ),
                    default: false,
                  },
                  authorProofingEnabled: {
                    type: 'boolean',
                    title: t('configPage.Author proofing enabled'),
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: t(
                      'configPage.Control pages visible to editors',
                    ),
                    minItems: 1,
                    default: ['Metadata'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Team',
                          title: t('configPage.showTabs.Team'),
                        },
                        {
                          const: 'Decision',
                          title: t('configPage.showTabs.Decision'),
                        },
                        {
                          const: 'Manuscript text',
                          title: t('configPage.showTabs.Manuscript text'),
                        },
                        {
                          const: 'Metadata',
                          title: t('configPage.showTabs.Metadata'),
                        },
                        {
                          const: 'Tasks & Notifications',
                          title: t('configPage.showTabs.Tasks & Notifications'),
                        },
                      ],
                      // enum: [
                      //   'Team',
                      //   'Decision',
                      //   'Manuscript text',
                      //   'Metadata',
                      //   'Tasks & Notifications',
                      // ],
                    },
                    uniqueItems: true,
                  },
                  // TODO: discuss more on this hiding features and refactor
                  // showFeatures: {
                  //   type: 'array',
                  //   description: 'Control page features visible to editors',
                  //   minItems: 1,
                  //   default: [
                  //     'Assign Editors',
                  //     'Reviews',
                  //     'Decision',
                  //     'Publish',
                  //   ],
                  //   items: {
                  //     type: 'string',
                  //     enum: [
                  //       'Assign Editors',
                  //       'Reviews',
                  //       'Decision',
                  //       'Publish',
                  //     ],
                  //   },
                  //   uniqueItems: true,
                  // },
                },
              },
              submission: {
                type: 'object',
                title: t('configPage.Submission'),
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title: t('configPage.allowToSubmitNewVersion'),
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: t('configPage.Review page'),
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: t('configPage.showSummary'),
                    default: false,
                  },
                },
              },
              production: {
                type: 'object',
                title: t('configPage.production.Production'),
                properties: {
                  crossrefRetrievalEmail: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Email to use for citation search',
                    ),
                    default: '',
                  },
                  crossrefSearchResultCount: {
                    type: 'number',
                    description: t(
                      'configPage.production.Number of results to return from citation search',
                    ),
                    default: 3,
                  },
                  styleName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select style formatting for citations',
                    ),
                    oneOf: [
                      {
                        const: 'apa',
                        title: t('configPage.production.apa'),
                      },
                      {
                        const: 'chicago-note-bibliography',
                        title: t('configPage.production.cmos'),
                      },
                      {
                        const: 'council-of-science-editors-alphabetical',
                        title: t('configPage.production.cse'),
                      },
                    ],
                    default: 'apa',
                  },
                  localeName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select locale for citations',
                    ),
                    enum: ['en-US', 'en-GB'],
                    default: 'en-US',
                  },
                },
              },
              publishing: {
                type: 'object',
                title: t('configPage.Publishing'),
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: t('configPage.Hypothesis'),
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis API key'),
                      },
                      group: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis group id'),
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: t('configPage.shouldAllowTagging'),
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title: t('configPage.reverseFieldOrder'),
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: t('configPage.Crossref'),
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalName'),
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalAbbreviatedName'),
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: t('configPage.journalHomepage'),
                      },
                      login: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefLogin'),
                      },
                      password: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefPassword'),
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefRegistrant'),
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorName'),
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorEmail'),
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: t('configPage.publicationType'),
                        // enum: ['article', 'peer review'],
                        oneOf: [
                          {
                            const: 'article',
                            title: t('configPage.article'),
                          },
                          {
                            const: 'peer review',
                            title: t('configPage.peer review'),
                          },
                        ],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: t('configPage.doiPrefix'),
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: t(
                          'configPage.publishedArticleLocationPrefix',
                        ),
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: t('configPage.licenseUrl'),
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: t('configPage.useSandbox'),
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: t('configPage.Webhook'),
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookUrl'),
                      },
                      token: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookToken'),
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookRef'),
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: t('configPage.Task Manager'),
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: t('configPage.teamTimezone'),
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: t('configPage.Emails'),
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthEmail'),
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailSenderEmail'),
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthPassword'),
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: t('configPage.eventNotification'),
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description: t(
                      'configPage.reviewerInvitationPrimaryEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationTemplate.const,
                  },
                  authorProofingInvitationEmailTemplate: {
                    description: t(
                      'configPage.authorProofingInvitationEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingInvitationTemplate.const,
                  },
                  authorProofingSubmittedEmailTemplate: {
                    description: t(
                      'configPage.authorProofingSubmittedEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingSubmittedTemplate.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description: t(
                      'configPage.alertUnreadMessageDigestTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  mentionNotificationTemplate: {
                    description:
                      'Immediate Notification for users @mentioned in a message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: t('configPage.Reports'),
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: t('configPage.reportShowInMenu'),
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: t('configPage.User Management'),
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title: t('configPage.userIsAdmin'),
                    default: false,
                  },
                },
              },
              kotahiApis: {
                type: 'object',
                title: t('configPage.kotahiApis'),
                properties: {
                  tokens: {
                    type: ['string', 'null'],
                    description: t('configPage.tokens'),
                  },
                },
              },
              coarNotify: {
                type: 'object',
                title: t('configPage.api'),
                properties: {
                  repoIpAddress: {
                    type: ['string', 'null'],
                    description: t('configPage.allowedIPs'),
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['prc'],
              },
              groupIdentity: {
                type: 'object',
                title: t('configPage.Group Identity'),
                properties: {
                  brandName: {
                    type: 'string',
                    description: t('configPage.Brand name'),
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: t('configPage.Brand primary colour'),
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: t('configPage.Brand secondary colour'),
                    default: '#9e9e9e',
                  },
                  // Default logo
                  logoPath: {
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                  logoId: {
                    description: t('configPage.Logo'),
                    type: ['string', 'null'],
                  },
                  favicon: {
                    description: t('configPage.Favicon'),
                    type: ['string', 'null'],
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: t('configPage.Dashboard'),
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description: t('configPage.landingPage'),
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: t('configPage.Dashboard Page'),
                      },
                      {
                        const: '/admin/manuscripts',
                        title: t('configPage.Manuscript Page'),
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: t('configPage.pagesVisibleToRegistered'),
                    minItems: 1,
                    default: ['submission', 'review', 'editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: t('configPage.My Submissions'),
                        },
                        {
                          const: 'review',
                          title: t('configPage.To Review'),
                        },
                        {
                          const: 'editor',
                          title: t("configPage.Manuscripts I'm editor of"),
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: t('configPage.Manuscripts page'),
                properties: {
                  tableColumns: {
                    type: 'string',
                    description: t(
                      'configPage.List columns to display on the Manuscripts page',
                    ),
                    default:
                      'shortId, titleAndAbstract, created, updated, status, submission.$customStatus, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description: t('configPage.numberOfManuscripts'),
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description: t('configPage.hourManuscriptsImported'),
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description: t('configPage.daysManuscriptRemain'),
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description: t('configPage.importFromSematic'),
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title: t('configPage.newSubmissionActionVisisble'),
                    default: false,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title: t('configPage.displayActionToSelect'),
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title: t('configPage.importManuscriptsManually'),
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: t('configPage.Control panel'),
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: t('configPage.Display manuscript short id'),
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: t('configPage.Reviewers can see submitted reviews'),
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: t(
                      'configPage.Authors can see individual peer reviews',
                    ),
                    default: false,
                  },
                  authorProofingEnabled: {
                    type: 'boolean',
                    title: t('configPage.Author proofing enabled'),
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: t(
                      'configPage.Control pages visible to editors',
                    ),
                    minItems: 1,
                    default: [
                      'Team',
                      'Decision',
                      'Manuscript text',
                      'Metadata',
                      'Tasks & Notifications',
                    ],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Team',
                          title: t('configPage.showTabs.Team'),
                        },
                        {
                          const: 'Decision',
                          title: t('configPage.showTabs.Decision'),
                        },
                        {
                          const: 'Manuscript text',
                          title: t('configPage.showTabs.Manuscript text'),
                        },
                        {
                          const: 'Metadata',
                          title: t('configPage.showTabs.Metadata'),
                        },
                        {
                          const: 'Tasks & Notifications',
                          title: t('configPage.showTabs.Tasks & Notifications'),
                        },
                      ],
                      // enum: [
                      //   'Team',
                      //   'Decision',
                      //   'Manuscript text',
                      //   'Metadata',
                      //   'Tasks & Notifications',
                      // ],
                    },
                    uniqueItems: true,
                  },
                  // TODO: discuss more on this hiding features and refactor
                  // showFeatures: {
                  //   type: 'array',
                  //   description: 'Control page features visible to editors',
                  //   minItems: 1,
                  //   default: ['Assign Editors', 'Reviews', 'Decision', 'Publish'],
                  //   items: {
                  //     type: 'string',
                  //     enum: ['Assign Editors', 'Reviews', 'Decision', 'Publish'],
                  //   },
                  //   uniqueItems: true,
                  // },
                },
              },
              submission: {
                type: 'object',
                title: t('configPage.Submission'),
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title: t('configPage.allowToSubmitNewVersion'),
                    default: true,
                  },
                },
              },
              review: {
                type: 'object',
                title: t('configPage.Review page'),
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: t('configPage.showSummary'),
                    default: false,
                  },
                },
              },
              production: {
                type: 'object',
                title: t('configPage.production.Production'),
                properties: {
                  crossrefRetrievalEmail: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Email to use for citation search',
                    ),
                    default: '',
                  },
                  crossrefSearchResultCount: {
                    type: 'number',
                    description: t(
                      'configPage.production.Number of results to return from citation search',
                    ),
                    default: 3,
                  },
                  styleName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select style formatting for citations',
                    ),
                    oneOf: [
                      {
                        const: 'apa',
                        title: t('configPage.production.apa'),
                      },
                      {
                        const: 'chicago-note-bibliography',
                        title: t('configPage.production.cmos'),
                      },
                      {
                        const: 'council-of-science-editors-alphabetical',
                        title: t('configPage.production.cse'),
                      },
                    ],
                    default: 'apa',
                  },
                  localeName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select locale for citations',
                    ),
                    enum: ['en-US', 'en-GB'],
                    default: 'en-US',
                  },
                },
              },
              publishing: {
                type: 'object',
                title: t('configPage.Publishing'),
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: t('configPage.Hypothesis'),
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis API key'),
                      },
                      group: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis group id'),
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: t('configPage.shouldAllowTagging'),
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title: t('configPage.reverseFieldOrder'),
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: t('configPage.Crossref'),
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalName'),
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalAbbreviatedName'),
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: t('configPage.journalHomepage'),
                      },
                      login: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefLogin'),
                      },
                      password: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefPassword'),
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefRegistrant'),
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorName'),
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorEmail'),
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: t('configPage.publicationType'),
                        // enum: ['article', 'peer review'],
                        oneOf: [
                          {
                            const: 'article',
                            title: t('configPage.article'),
                          },
                          {
                            const: 'peer review',
                            title: t('configPage.peer review'),
                          },
                        ],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: t('configPage.doiPrefix'),
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: t(
                          'configPage.publishedArticleLocationPrefix',
                        ),
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: t('configPage.licenseUrl'),
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: t('configPage.useSandbox'),
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: t('configPage.Webhook'),
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookUrl'),
                      },
                      token: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookToken'),
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookRef'),
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: t('configPage.Task Manager'),
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: t('configPage.teamTimezone'),
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: t('configPage.Emails'),
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthEmail'),
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailSenderEmail'),
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthPassword'),
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: t('configPage.eventNotification'),
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description: t(
                      'configPage.reviewerInvitationPrimaryEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationTemplate.const,
                  },
                  authorProofingInvitationEmailTemplate: {
                    description: t(
                      'configPage.authorProofingInvitationEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingInvitationTemplate.const,
                  },
                  authorProofingSubmittedEmailTemplate: {
                    description: t(
                      'configPage.authorProofingSubmittedEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingSubmittedTemplate.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description: t(
                      'configPage.alertUnreadMessageDigestTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  mentionNotificationTemplate: {
                    description:
                      'Immediate Notification for users @mentioned in a message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: t('configPage.Reports'),
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: t('configPage.reportShowInMenu'),
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: t('configPage.User Management'),
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title: t('configPage.userIsAdmin'),
                    default: false,
                  },
                },
              },
              kotahiApis: {
                type: 'object',
                title: t('configPage.kotahiApis'),
                properties: {
                  tokens: {
                    type: ['string', 'null'],
                    description: t('configPage.tokens'),
                  },
                },
              },
              coarNotify: {
                type: 'object',
                title: t('configPage.api'),
                properties: {
                  repoIpAddress: {
                    type: ['string', 'null'],
                    description: t('configPage.allowedIPs'),
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['journal'],
              },
              groupIdentity: {
                type: 'object',
                title: t('configPage.Group Identity'),
                properties: {
                  brandName: {
                    type: 'string',
                    description: t('configPage.Brand name'),
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: t('configPage.Brand primary colour'),
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: t('configPage.Brand secondary colour'),
                    default: '#9e9e9e',
                  },
                  // Default logo
                  logoPath: {
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                  logoId: {
                    description: t('configPage.Logo'),
                    type: ['string', 'null'],
                  },
                  favicon: {
                    description: t('configPage.Favicon'),
                    type: ['string', 'null'],
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: t('configPage.Dashboard'),
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description: t('configPage.landingPage'),
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: t('configPage.Dashboard Page'),
                      },
                      {
                        const: '/admin/manuscripts',
                        title: t('configPage.Manuscript Page'),
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: t('configPage.pagesVisibleToRegistered'),
                    minItems: 1,
                    default: ['submission', 'review', 'editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: t('configPage.My Submissions'),
                        },
                        {
                          const: 'review',
                          title: t('configPage.To Review'),
                        },
                        {
                          const: 'editor',
                          title: t("configPage.Manuscripts I'm editor of"),
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: t('configPage.Manuscripts page'),
                properties: {
                  tableColumns: {
                    type: 'string',
                    description: t(
                      'configPage.List columns to display on the Manuscripts page',
                    ),
                    default:
                      'shortId, titleAndAbstract, created, updated, status, submission.$customStatus, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description: t('configPage.numberOfManuscripts'),
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description: t('configPage.hourManuscriptsImported'),
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description: t('configPage.daysManuscriptRemain'),
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description: t('configPage.importFromSematic'),
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title: t('configPage.newSubmissionActionVisisble'),
                    default: false,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title: t('configPage.displayActionToSelect'),
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title: t('configPage.importManuscriptsManually'),
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: t('configPage.Control panel'),
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: t('configPage.Display manuscript short id'),
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: t('configPage.Reviewers can see submitted reviews'),
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: t(
                      'configPage.Authors can see individual peer reviews',
                    ),
                    default: false,
                  },
                  authorProofingEnabled: {
                    type: 'boolean',
                    title: t('configPage.Author proofing enabled'),
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: t(
                      'configPage.Control pages visible to editors',
                    ),
                    minItems: 1,
                    default: [
                      'Team',
                      'Decision',
                      'Manuscript text',
                      'Metadata',
                      'Tasks & Notifications',
                    ],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'Team',
                          title: t('configPage.showTabs.Team'),
                        },
                        {
                          const: 'Decision',
                          title: t('configPage.showTabs.Decision'),
                        },
                        {
                          const: 'Manuscript text',
                          title: t('configPage.showTabs.Manuscript text'),
                        },
                        {
                          const: 'Metadata',
                          title: t('configPage.showTabs.Metadata'),
                        },
                        {
                          const: 'Tasks & Notifications',
                          title: t('configPage.showTabs.Tasks & Notifications'),
                        },
                      ],
                      // enum: [
                      //   'Team',
                      //   'Decision',
                      //   'Manuscript text',
                      //   'Metadata',
                      //   'Tasks & Notifications',
                      // ],
                    },
                    uniqueItems: true,
                  },
                  // TODO: discuss more on this hiding features and refactor
                  // showFeatures: {
                  //   type: 'array',
                  //   description: 'Control page features visible to editors',
                  //   minItems: 1,
                  //   default: ['Assign Editors', 'Reviews', 'Decision', 'Publish'],
                  //   items: {
                  //     type: 'string',
                  //     enum: ['Assign Editors', 'Reviews', 'Decision', 'Publish'],
                  //   },
                  //   uniqueItems: true,
                  // },
                },
              },
              submission: {
                type: 'object',
                title: t('configPage.Submission'),
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title: t('configPage.allowToSubmitNewVersion'),
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: t('configPage.Review page'),
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: t('configPage.showSummary'),
                    default: false,
                  },
                },
              },
              production: {
                type: 'object',
                title: t('configPage.production.Production'),
                properties: {
                  crossrefRetrievalEmail: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Email to use for citation search',
                    ),
                    default: '',
                  },
                  crossrefSearchResultCount: {
                    type: 'number',
                    description: t(
                      'configPage.production.Number of results to return from citation search',
                    ),
                    default: 3,
                  },
                  styleName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select style formatting for citations',
                    ),
                    oneOf: [
                      {
                        const: 'apa',
                        title: t('configPage.production.apa'),
                      },
                      {
                        const: 'chicago-note-bibliography',
                        title: t('configPage.production.cmos'),
                      },
                      {
                        const: 'council-of-science-editors-alphabetical',
                        title: t('configPage.production.cse'),
                      },
                    ],
                    default: 'apa',
                  },
                  localeName: {
                    type: ['string', 'null'],
                    description: t(
                      'configPage.production.Select locale for citations',
                    ),
                    enum: ['en-US', 'en-GB'],
                    default: 'en-US',
                  },
                },
              },
              publishing: {
                type: 'object',
                title: t('configPage.Publishing'),
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: t('configPage.Hypothesis'),
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis API key'),
                      },
                      group: {
                        type: ['string', 'null'],
                        description: t('configPage.Hypothesis group id'),
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: t('configPage.shouldAllowTagging'),
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title: t('configPage.reverseFieldOrder'),
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: t('configPage.Crossref'),
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalName'),
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: t('configPage.journalAbbreviatedName'),
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: t('configPage.journalHomepage'),
                      },
                      login: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefLogin'),
                      },
                      password: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefPassword'),
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefRegistrant'),
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorName'),
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: t('configPage.crossrefDepositorEmail'),
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: t('configPage.publicationType'),
                        // enum: ['article', 'peer review'],
                        default: 'article',
                        oneOf: [
                          {
                            const: 'article',
                            title: t('configPage.article'),
                          },
                          {
                            const: 'peer review',
                            title: t('configPage.peer review'),
                          },
                        ],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: t('configPage.doiPrefix'),
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: t(
                          'configPage.publishedArticleLocationPrefix',
                        ),
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: t('configPage.licenseUrl'),
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: t('configPage.useSandbox'),
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: t('configPage.Webhook'),
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookUrl'),
                      },
                      token: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookToken'),
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: t('configPage.webhookRef'),
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: t('configPage.Task Manager'),
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: t('configPage.teamTimezone'),
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: t('configPage.Emails'),
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthEmail'),
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailSenderEmail'),
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: t('configPage.gmailAuthPassword'),
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: t('configPage.eventNotification'),
                properties: {
                  reviewRejectedEmailTemplate: {
                    description: t('configPage.reviewRejectedEmailTemplate'),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  reviewerInvitationPrimaryEmailTemplate: {
                    description: t(
                      'configPage.reviewerInvitationPrimaryEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationTemplate.const,
                  },
                  evaluationCompleteEmailTemplate: {
                    description: t(
                      'configPage.evaluationCompleteEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  submissionConfirmationEmailTemplate: {
                    description: t(
                      'configPage.submissionConfirmationEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  authorProofingInvitationEmailTemplate: {
                    description: t(
                      'configPage.authorProofingInvitationEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingInvitationTemplate.const,
                  },
                  authorProofingSubmittedEmailTemplate: {
                    description: t(
                      'configPage.authorProofingSubmittedEmailTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultAuthorProofingSubmittedTemplate.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description: t(
                      'configPage.alertUnreadMessageDigestTemplate',
                    ),
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  mentionNotificationTemplate: {
                    description:
                      'Immediate Notification for users @mentioned in a message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: t('configPage.Reports'),
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: t('configPage.reportShowInMenu'),
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: t('configPage.User Management'),
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title: t('configPage.userIsAdmin'),
                    default: false,
                  },
                },
              },
              kotahiApis: {
                type: 'object',
                title: t('configPage.kotahiApis'),
                properties: {
                  tokens: {
                    type: ['string', 'null'],
                    description: t('configPage.tokens'),
                  },
                },
              },
              coarNotify: {
                type: 'object',
                title: t('configPage.api'),
                properties: {
                  repoIpAddress: {
                    type: ['string', 'null'],
                    description: t('configPage.allowedIPs'),
                  },
                },
              },
            },
          },
        ],
      },
    },
  }

  const uiSchema = {
    instanceName: {
      'ui:disabled': true,
    },
    groupIdentity: {
      primaryColor: {
        // To find alternate way to limit width if possible! Interim solution
        'ui:widget': props => {
          return (
            <input
              className="form-control"
              onChange={event => props.onChange(event.target.value)}
              // eslint-disable-next-line react/destructuring-assignment
              required={props.required}
              style={{ width: '10%' }}
              type="color"
              // eslint-disable-next-line react/destructuring-assignment
              value={props.value}
            />
          )
        },
      },
      secondaryColor: {
        // To find alternate way to limit width if possible! Interim solution
        'ui:widget': props => {
          return (
            <input
              className="form-control"
              onChange={event => props.onChange(event.target.value)}
              // eslint-disable-next-line react/destructuring-assignment
              required={props.required}
              style={{ width: '10%' }}
              type="color"
              // eslint-disable-next-line react/destructuring-assignment
              value={props.value}
            />
          )
        },
      },
      // Default logo
      logoPath: {
        'ui:widget': 'hidden',
      },
      logoId: {
        'ui:widget': props => {
          return (
            <BrandIcon
              config={config}
              createFile={createFile}
              deleteFile={deleteFile}
              fieldName="logo"
              fileType="brandLogo"
              inputProps={props}
              mimeTypesToAccept={'image/*'}
              setFileId={setLogoId}
            />
          )
        },
        'ui:options': {
          accept: 'image/*',
        },
      },
      favicon: {
        'ui:widget': props => {
          return (
            <BrandIcon
              config={config}
              createFile={createFile}
              deleteFile={deleteFile}
              fieldName="icon"
              fileType="favicon"
              inputProps={props}
              mimeTypesToAccept="image/png,image/gif"
              setFileId={setFavicon}
            />
          )
        },
        'ui:options': {
          accept: 'image/png,image/gif',
        },
      },
    },
    dashboard: {
      showSections: {
        'ui:widget': 'checkboxes',
      },
    },
    controlPanel: {
      showTabs: {
        'ui:widget': 'checkboxes',
      },
      showFeatures: {
        'ui:widget': 'checkboxes',
      },
    },
    publishing: {
      hypothesis: {
        classNames: 'col-md-12 col-md-offset-0',
      },
      crossref: {
        classNames: 'col-md-12 col-md-offset-0',
        password: {
          'ui:widget': 'password',
        },
      },
      webhook: {
        classNames: 'col-md-12 col-md-offset-0',
      },
    },
    notification: {
      gmailAuthPassword: {
        'ui:widget': 'password',
      },
    },
  }

  return { schema, uiSchema }
}

export default generateSchema
