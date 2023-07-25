/* eslint-disable no-unused-vars */
import React from 'react'

const generateSchema = (
  emailNotificationOptions,
  defaultReviewerInvitationEmail,
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
    title: 'Instance Type',
    properties: {
      instanceName: {
        type: 'string',
        enum: ['elife', 'ncrc', 'colab', 'aperture'],
        default: 'aperture',
      },
    },
    required: ['instanceName'],
    dependencies: {
      instanceName: {
        oneOf: [
          {
            properties: {
              instanceName: {
                enum: ['elife'],
              },
              groupIdentity: {
                type: 'object',
                title: 'Group Identity',
                properties: {
                  brandName: {
                    type: 'string',
                    description: 'Brand name',
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: 'Brand primary colour',
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: 'Brand secondary colour',
                    default: '#9e9e9e',
                  },
                  logoPath: {
                    description: 'Logo',
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: 'Dashboard',
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description:
                      'Landing page for Group Manager users upon login',
                    default: '/admin/manuscripts',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: 'Dashboard Page',
                      },
                      {
                        const: '/admin/manuscripts',
                        title: 'Manuscript Page',
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: 'Dashboard pages visible to registered users',
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: 'My Submissions',
                        },
                        {
                          const: 'review',
                          title: 'To Review',
                        },
                        {
                          const: 'editor',
                          title: "Manuscripts I'm editor of",
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: 'Manuscripts page',
                properties: {
                  tableColumns: {
                    type: 'string',
                    description:
                      'List columns to display on the Manuscripts page',
                    default:
                      'shortId, meta.title, created, updated, status, submission.labels, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description:
                      'Number of manuscripts listed per page on the Manucripts page',
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description:
                      'Hour when manuscripts are imported daily (UTC)',
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description:
                      'Number of days a manuscript should remain in the Manuscripts page before being automatically archived',
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description:
                      'Import manuscripts from Sematic Scholar no older than ‘x’ number of days',
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title:
                      "'Add new submission' action visible on the Manuscripts page",
                    default: true,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title:
                      'Display action to ‘Select’ manuscripts for review from the Manuscripts page',
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title:
                      "Import manuscripts manually using the 'Refresh' action",
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: 'Control panel',
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: 'Display manuscript short id',
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: 'Reviewers can see submitted reviews',
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: 'Authors can see individual peer reviews',
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: 'Control pages visible to editors',
                    minItems: 1,
                    default: ['Metadata'],
                    items: {
                      type: 'string',
                      enum: [
                        'Team',
                        'Decision',
                        'Manuscript text',
                        'Metadata',
                        'Tasks & Notifications',
                      ],
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
                title: 'Submission',
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title:
                      'Allow an author to submit a new version of their manuscript at any time',
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: 'Review page',
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: 'Reviewers can see the Decision form data ',
                    default: false,
                  },
                },
              },
              publishing: {
                type: 'object',
                title: 'Publishing',
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: 'Hypothesis',
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: 'Hypothesis API key',
                      },
                      group: {
                        type: ['string', 'null'],
                        description: 'Hypothesis group id',
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: 'Apply Hypothesis tags in the submission form',
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title:
                          'Reverse the order of Submission/Decision form fields published to Hypothesis',
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: 'Crossref',
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: 'Journal/Group name',
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: 'Abbreviated name',
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: 'Home page',
                      },
                      login: {
                        type: ['string', 'null'],
                        description: 'Crossref username',
                      },
                      password: {
                        type: ['string', 'null'],
                        description: 'Crossref password',
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: 'Crossref registrant id',
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: 'Crossref depositor name',
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: 'Depositor email address',
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: 'Select publication type',
                        enum: ['article', 'peer review'],
                        default: 'peer review',
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref DOI prefix',
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref published article location',
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: 'Publication license URL',
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: 'Publish to Crossref sandbox',
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: 'Webhook',
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook URL',
                      },
                      token: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook token',
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook reference',
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: 'Task Manager',
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: 'Set timezone for Task Manager due dates',
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: 'Emails',
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail email address',
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail sender email address',
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: 'Gmail password',
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: 'Event Notifications',
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description:
                      'Reviewer invitation email template for a new manuscript',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationEmail.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description:
                      'Email to send when a user has an unread chat message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: 'Reports',
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: 'Group Manager and admin can access Reports',
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: 'User Management',
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title:
                      'All users are assigned Group Manager and Admin roles',
                    default: false,
                  },
                  kotahiApiTokens: {
                    type: ['string', 'null'],
                    description: 'Kotahi API tokens',
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['ncrc'],
              },
              groupIdentity: {
                type: 'object',
                title: 'Group Identity',
                properties: {
                  brandName: {
                    type: 'string',
                    description: 'Brand name',
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: 'Brand primary colour',
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: 'Brand secondary colour',
                    default: '#9e9e9e',
                  },
                  logoPath: {
                    description: 'Logo',
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: 'Dashboard',
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description:
                      'Landing page for Group Manager users upon login',
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: 'Dashboard Page',
                      },
                      {
                        const: '/admin/manuscripts',
                        title: 'Manuscript Page',
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: 'Dashboard pages visible to registered users',
                    minItems: 1,
                    default: ['editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: 'My Submissions',
                        },
                        {
                          const: 'review',
                          title: 'To Review',
                        },
                        {
                          const: 'editor',
                          title: "Manuscripts I'm editor of",
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: 'Manuscripts page',
                properties: {
                  tableColumns: {
                    type: 'string',
                    description:
                      'List columns to display on the Manuscripts page',
                    default:
                      'shortId, meta.title, created, updated, status, submission.labels, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description:
                      'Number of manuscripts listed per page on the Manucripts page',
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description:
                      'Hour when manuscripts are imported daily (UTC)',
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description:
                      'Number of days a manuscript should remain in the Manuscripts page before being automatically archived',
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description:
                      'Import manuscripts from Sematic Scholar no older than ‘x’ number of days',
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title:
                      "'Add new submission' action visible on the Manuscripts page",
                    default: true,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title:
                      'Display action to ‘Select’ manuscripts for review from the Manuscripts page',
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title:
                      "Import manuscripts manually using the 'Refresh' action",
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: 'Control panel',
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: 'Display manuscript short id',
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: 'Reviewers can see submitted reviews',
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: 'Authors can see individual peer reviews',
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: 'Control pages visible to editors',
                    minItems: 1,
                    default: ['Metadata'],
                    items: {
                      type: 'string',
                      enum: [
                        'Team',
                        'Decision',
                        'Manuscript text',
                        'Metadata',
                        'Tasks & Notifications',
                      ],
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
                title: 'Submission',
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title:
                      'Allow an author to submit a new version of their manuscript at any time',
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: 'Review page',
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: 'Reviewers can see the Decision form data ',
                    default: false,
                  },
                },
              },
              publishing: {
                type: 'object',
                title: 'Publishing',
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: 'Hypothesis',
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: 'Hypothesis API key',
                      },
                      group: {
                        type: ['string', 'null'],
                        description: 'Hypothesis group id',
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: 'Apply Hypothesis tags in the submission form',
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title:
                          'Reverse the order of Submission/Decision form fields published to Hypothesis',
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: 'Crossref',
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: 'Journal/Group name',
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: 'Abbreviated name',
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: 'Home page',
                      },
                      login: {
                        type: ['string', 'null'],
                        description: 'Crossref username',
                      },
                      password: {
                        type: ['string', 'null'],
                        description: 'Crossref password',
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: 'Crossref registrant id',
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: 'Crossref depositor name',
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: 'Depositor email address',
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: 'Select publication type',
                        enum: ['article', 'peer review'],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref DOI prefix',
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref published article location',
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: 'Publication license URL',
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: 'Publish to Crossref sandbox',
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: 'Webhook',
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook URL',
                      },
                      token: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook token',
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook reference',
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: 'Task Manager',
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: 'Set timezone for Task Manager due dates',
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: 'Emails',
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail email address',
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail sender email address',
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: 'Gmail password',
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: 'Event Notifications',
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description:
                      'Reviewer invitation email template for a new manuscript',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationEmail.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description:
                      'Email to send when a user has an unread chat message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: 'Reports',
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: 'Group Manager and admin can access Reports',
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: 'User Management',
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title:
                      'All users are assigned Group Manager and Admin roles',
                    default: false,
                  },
                  kotahiApiTokens: {
                    type: ['string', 'null'],
                    description: 'Kotahi API tokens',
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['colab'],
              },
              groupIdentity: {
                type: 'object',
                title: 'Group Identity',
                properties: {
                  brandName: {
                    type: 'string',
                    description: 'Brand name',
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: 'Brand primary colour',
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: 'Brand secondary colour',
                    default: '#9e9e9e',
                  },
                  logoPath: {
                    description: 'Logo',
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: 'Dashboard',
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description:
                      'Landing page for Group Manager users upon login',
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: 'Dashboard Page',
                      },
                      {
                        const: '/admin/manuscripts',
                        title: 'Manuscript Page',
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: 'Dashboard pages visible to registered users',
                    minItems: 1,
                    default: ['submission', 'review', 'editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: 'My Submissions',
                        },
                        {
                          const: 'review',
                          title: 'To Review',
                        },
                        {
                          const: 'editor',
                          title: "Manuscripts I'm editor of",
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: 'Manuscripts page',
                properties: {
                  tableColumns: {
                    type: 'string',
                    description:
                      'List columns to display on the Manuscripts page',
                    default:
                      'shortId, meta.title, created, updated, status, submission.labels, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description:
                      'Number of manuscripts listed per page on the Manucripts page',
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description:
                      'Hour when manuscripts are imported daily (UTC)',
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description:
                      'Number of days a manuscript should remain in the Manuscripts page before being automatically archived',
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description:
                      'Import manuscripts from Sematic Scholar no older than ‘x’ number of days',
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title:
                      "'Add new submission' action visible on the Manuscripts page",
                    default: false,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title:
                      'Display action to ‘Select’ manuscripts for review from the Manuscripts page',
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title:
                      "Import manuscripts manually using the 'Refresh' action",
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: 'Control panel',
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: 'Display manuscript short id',
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: 'Reviewers can see submitted reviews',
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: 'Authors can see individual peer reviews',
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: 'Control pages visible to editors',
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
                      enum: [
                        'Team',
                        'Decision',
                        'Manuscript text',
                        'Metadata',
                        'Tasks & Notifications',
                      ],
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
                title: 'Submission',
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title:
                      'Allow an author to submit a new version of their manuscript at any time',
                    default: true,
                  },
                },
              },
              review: {
                type: 'object',
                title: 'Review page',
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: 'Reviewers can see the Decision form data ',
                    default: false,
                  },
                },
              },
              publishing: {
                type: 'object',
                title: 'Publishing',
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: 'Hypothesis',
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: 'Hypothesis API key',
                      },
                      group: {
                        type: ['string', 'null'],
                        description: 'Hypothesis group id',
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: 'Apply Hypothesis tags in the submission form',
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title:
                          'Reverse the order of Submission/Decision form fields published to Hypothesis',
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: 'Crossref',
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: 'Journal/Group name',
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: 'Abbreviated name',
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: 'Home page',
                      },
                      login: {
                        type: ['string', 'null'],
                        description: 'Crossref username',
                      },
                      password: {
                        type: ['string', 'null'],
                        description: 'Crossref password',
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: 'Crossref registrant id',
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: 'Crossref depositor name',
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: 'Depositor email address',
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: 'Select publication type',
                        enum: ['article', 'peer review'],
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref DOI prefix',
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref published article location',
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: 'Publication license URL',
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: 'Publish to Crossref sandbox',
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: 'Webhook',
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook URL',
                      },
                      token: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook token',
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook reference',
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: 'Task Manager',
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: 'Set timezone for Task Manager due dates',
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: 'Emails',
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail email address',
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail sender email address',
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: 'Gmail password',
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: 'Event Notifications',
                properties: {
                  reviewerInvitationPrimaryEmailTemplate: {
                    description:
                      'Reviewer invitation email template for a new manuscript',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationEmail.const,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description:
                      'Email to send when a user has an unread chat message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: 'Reports',
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: 'Group Manager and admin can access Reports',
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: 'User Management',
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title:
                      'All users are assigned Group Manager and Admin roles',
                    default: false,
                  },
                  kotahiApiTokens: {
                    type: ['string', 'null'],
                    description: 'Kotahi API tokens',
                  },
                },
              },
            },
          },
          {
            properties: {
              instanceName: {
                enum: ['aperture'],
              },
              groupIdentity: {
                type: 'object',
                title: 'Group Identity',
                properties: {
                  brandName: {
                    type: 'string',
                    description: 'Brand name',
                    default: 'Kotahi',
                  },
                  primaryColor: {
                    type: 'string',
                    description: 'Brand primary colour',
                    default: '#3aae2a',
                  },
                  secondaryColor: {
                    type: 'string',
                    description: 'Brand secondary colour',
                    default: '#9e9e9e',
                  },
                  logoPath: {
                    description: 'Logo',
                    type: 'string',
                    default: '/assets/logo-kotahi.png',
                  },
                },
              },
              dashboard: {
                type: 'object',
                title: 'Dashboard',
                properties: {
                  loginRedirectUrl: {
                    type: 'string',
                    description:
                      'Landing page for Group Manager users upon login',
                    default: '/dashboard',
                    oneOf: [
                      {
                        const: '/dashboard',
                        title: 'Dashboard Page',
                      },
                      {
                        const: '/admin/manuscripts',
                        title: 'Manuscript Page',
                      },
                    ],
                  },
                  showSections: {
                    type: 'array',
                    description: 'Dashboard pages visible to registered users',
                    minItems: 1,
                    default: ['submission', 'review', 'editor'],
                    items: {
                      type: 'string',
                      oneOf: [
                        {
                          const: 'submission',
                          title: 'My Submissions',
                        },
                        {
                          const: 'review',
                          title: 'To Review',
                        },
                        {
                          const: 'editor',
                          title: "Manuscripts I'm editor of",
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                },
              },
              manuscript: {
                type: 'object',
                title: 'Manuscripts page',
                properties: {
                  tableColumns: {
                    type: 'string',
                    description:
                      'List columns to display on the Manuscripts page',
                    default:
                      'shortId, meta.title, created, updated, status, submission.labels, author',
                  },
                  paginationCount: {
                    type: 'number',
                    description:
                      'Number of manuscripts listed per page on the Manucripts page',
                    enum: [10, 20, 50, 100],
                    default: 10,
                  },
                  autoImportHourUtc: {
                    type: 'integer',
                    description:
                      'Hour when manuscripts are imported daily (UTC)',
                    $ref: '#/definitions/hours',
                  },
                  archivePeriodDays: {
                    type: 'integer',
                    description:
                      'Number of days a manuscript should remain in the Manuscripts page before being automatically archived',
                    minimum: 1,
                    maximum: 90,
                  },
                  semanticScholarImportsRecencyPeriodDays: {
                    type: 'integer',
                    description:
                      'Import manuscripts from Sematic Scholar no older than ‘x’ number of days',
                    minimum: 1,
                    maximum: 90,
                  },
                  newSubmission: {
                    type: 'boolean',
                    title:
                      "'Add new submission' action visible on the Manuscripts page",
                    default: false,
                  },
                  labelColumn: {
                    type: 'boolean',
                    title:
                      'Display action to ‘Select’ manuscripts for review from the Manuscripts page',
                    default: false,
                  },
                  manualImport: {
                    type: 'boolean',
                    title:
                      "Import manuscripts manually using the 'Refresh' action",
                    default: false,
                  },
                },
              },
              controlPanel: {
                type: 'object',
                title: 'Control panel',
                properties: {
                  displayManuscriptShortId: {
                    type: 'boolean',
                    title: 'Display manuscript short id',
                    default: true,
                  },
                  sharedReview: {
                    type: 'boolean',
                    title: 'Reviewers can see submitted reviews',
                    default: false,
                  },
                  hideReview: {
                    type: 'boolean',
                    title: 'Authors can see individual peer reviews',
                    default: false,
                  },
                  showTabs: {
                    type: 'array',
                    description: 'Control pages visible to editors',
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
                      enum: [
                        'Team',
                        'Decision',
                        'Manuscript text',
                        'Metadata',
                        'Tasks & Notifications',
                      ],
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
                title: 'Submission',
                properties: {
                  allowAuthorsSubmitNewVersion: {
                    type: 'boolean',
                    title:
                      'Allow an author to submit a new version of their manuscript at any time',
                    default: false,
                  },
                },
              },
              review: {
                type: 'object',
                title: 'Review page',
                properties: {
                  showSummary: {
                    type: 'boolean',
                    title: 'Reviewers can see the Decision form data ',
                    default: false,
                  },
                },
              },
              publishing: {
                type: 'object',
                title: 'Publishing',
                properties: {
                  hypothesis: {
                    type: 'object',
                    title: 'Hypothesis',
                    properties: {
                      apiKey: {
                        type: ['string', 'null'],
                        description: 'Hypothesis API key',
                      },
                      group: {
                        type: ['string', 'null'],
                        description: 'Hypothesis group id',
                      },
                      shouldAllowTagging: {
                        type: 'boolean',
                        title: 'Apply Hypothesis tags in the submission form',
                        default: false,
                      },
                      reverseFieldOrder: {
                        type: 'boolean',
                        title:
                          'Reverse the order of Submission/Decision form fields published to Hypothesis',
                        default: false,
                      },
                    },
                  },
                  crossref: {
                    type: 'object',
                    title: 'Crossref',
                    properties: {
                      journalName: {
                        type: ['string', 'null'],
                        description: 'Journal/Group name',
                      },
                      journalAbbreviatedName: {
                        type: ['string', 'null'],
                        description: 'Abbreviated name',
                      },
                      journalHomepage: {
                        type: ['string', 'null'],
                        description: 'Home page',
                      },
                      login: {
                        type: ['string', 'null'],
                        description: 'Crossref username',
                      },
                      password: {
                        type: ['string', 'null'],
                        description: 'Crossref password',
                      },
                      registrant: {
                        type: ['string', 'null'],
                        description: 'Crossref registrant id',
                      },
                      depositorName: {
                        type: ['string', 'null'],
                        description: 'Crossref depositor name',
                      },
                      depositorEmail: {
                        type: ['string', 'null'],
                        description: 'Depositor email address',
                        // format: 'email',
                      },
                      publicationType: {
                        type: ['string', 'null'],
                        description: 'Select publication type',
                        enum: ['article', 'peer review'],
                        default: 'article',
                      },
                      doiPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref DOI prefix',
                      },
                      publishedArticleLocationPrefix: {
                        type: ['string', 'null'],
                        description: 'Crossref published article location',
                      },
                      licenseUrl: {
                        type: ['string', 'null'],
                        description: 'Publication license URL',
                      },
                      useSandbox: {
                        type: 'boolean',
                        title: 'Publish to Crossref sandbox',
                        default: false,
                      },
                    },
                  },
                  webhook: {
                    type: 'object',
                    title: 'Webhook',
                    properties: {
                      url: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook URL',
                      },
                      token: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook token',
                      },
                      ref: {
                        type: ['string', 'null'],
                        description: 'Publishing webhook reference',
                      },
                    },
                  },
                },
              },
              taskManager: {
                type: 'object',
                title: 'Task Manager',
                properties: {
                  teamTimezone: {
                    type: 'string',
                    description: 'Set timezone for Task Manager due dates',
                    default: 'Etc/UTC',
                    $ref: '#/definitions/timezones',
                  },
                },
              },
              notification: {
                type: 'object',
                title: 'Emails',
                properties: {
                  gmailAuthEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail email address',
                    // format: 'email',
                  },
                  gmailSenderEmail: {
                    type: ['string', 'null'],
                    description: 'Gmail sender email address',
                    // format: 'email',
                  },
                  gmailAuthPassword: {
                    type: ['string', 'null'],
                    description: 'Gmail password',
                  },
                },
              },
              eventNotification: {
                type: 'object',
                title: 'Event Notifications',
                properties: {
                  reviewRejectedEmailTemplate: {
                    description:
                      'Email Template to trigger if a manuscript is rejected by the reviewer',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  reviewerInvitationPrimaryEmailTemplate: {
                    description:
                      'Reviewer invitation email template for a new manuscript',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                    default: defaultReviewerInvitationEmail.const,
                  },
                  evaluationCompleteEmailTemplate: {
                    description:
                      'Email Template to trigger once evaluation of a manuscript is completed',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  submissionConfirmationEmailTemplate: {
                    description:
                      'Email Template to trigger after a manuscript is submitted',
                    type: 'string',
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                  alertUnreadMessageDigestTemplate: {
                    description:
                      'Email to send when a user has an unread chat message',
                    type: ['string', 'null'],
                    oneOf: emailNotificationOptions,
                    uniqueItems: true,
                  },
                },
              },
              report: {
                type: 'object',
                title: 'Reports',
                properties: {
                  showInMenu: {
                    type: 'boolean',
                    title: 'Group Manager and admin can access Reports',
                    default: true,
                  },
                },
              },
              user: {
                type: 'object',
                title: 'User Management',
                properties: {
                  isAdmin: {
                    type: 'boolean',
                    title:
                      'All users are assigned Group Manager and Admin roles',
                    default: false,
                  },
                  kotahiApiTokens: {
                    type: ['string', 'null'],
                    description: 'Kotahi API tokens',
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
