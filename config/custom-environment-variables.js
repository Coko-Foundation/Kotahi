module.exports = {
  'auth-orcid': {
    useSandboxedOrcid: 'USE_SANDBOXED_ORCID',
    clientID: 'ORCID_CLIENT_ID',
    clientSecret: 'ORCID_CLIENT_SECRET',
  },
  'pubsweet-client': {
    protocol: 'CLIENT_PROTOCOL',
    host: 'CLIENT_HOST',
    port: 'CLIENT_PORT',
    publicProtocol: 'PUBLIC_CLIENT_PROTOCOL',
    publicHost: 'PUBLIC_CLIENT_HOST',
    publicPort: 'PUBLIC_CLIENT_PORT',
  },
  'pubsweet-server': {
    protocol: 'SERVER_PROTOCOL',
    host: 'SERVER_HOST',
    port: 'SERVER_PORT',
    secret: 'PUBSWEET_SECRET',
    db: {
      host: 'POSTGRES_HOST',
      // TODO: The port variable actually gets set to e.g. tcp://172.0.2.1:5321
      // by GitLab's CI - this a bug in their code.
      // Resulting in: RangeError [ERR_SOCKET_BAD_PORT]: Port should be >= 0 and < 65536. Received NaN.
      // port: 'POSTGRES_PORT',
      database: 'POSTGRES_DB',
      user: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
    },
  },
  'client-features': {
    displayShortIdAsIdentifier: 'DISPLAY_SHORTID_AS_IDENTIFIER',
    manuscriptsTableColumns: 'MANUSCRIPTS_TABLE_COLUMNS',
  },
  'publishing-webhook': {
    publishingWebhookUrl: 'PUBLISHING_WEBHOOK_URL',
    publishingWebhookToken: 'PUBLISHING_WEBHOOK_TOKEN',
    publishingWebhookRef: 'PUBLISHING_WEBHOOK_REF',
  },
  s3: {
    accessKeyId: 'S3_ACCESS_KEY_ID',
    secretAccessKey: 'S3_ACCESS_KEY_SECRET',
    endpoint: 'S3_ENDPOINT',
    region: 'S3_REGION',
    bucket: 'S3_BUCKET',
  },
  crossref: {
    login: 'CROSSREF_LOGIN',
    password: 'CROSSREF_PASSWORD',
    registrant: 'CROSSREF_REGISTRANT',
    depositorName: 'CROSSREF_DEPOSITOR_NAME',
    depositorEmail: 'CROSSREF_DEPOSITOR_EMAIL',
    publicationType: 'CROSSREF_PUBLICATION_TYPE',
    doiPrefix: 'DOI_PREFIX',
    publishedArticleLocationPrefix: 'PUBLISHED_ARTICLE_LOCATION_PREFIX',
    licenseUrl: 'PUBLICATION_LICENSE_URL',
    useSandbox: 'CROSSREF_USE_SANDBOX',
    journalName: 'JOURNAL_NAME',
    journalAbbreviatedName: 'JOURNAL_ABBREVIATED_NAME',
    journalHomepage: 'JOURNAL_HOMEPAGE',
  },
  api: {
    tokens: 'KOTAHI_API_TOKENS',
  },
  hypothesis: {
    apiKey: 'HYPOTHESIS_API_KEY',
    group: 'HYPOTHESIS_GROUP',
    publishFields: 'HYPOTHESIS_PUBLISH_FIELDS',
  },
  review: {
    shared: 'REVIEW_SHARED',
    hide: 'REVIEW_HIDE',
  },
  'notification-email': {
    automated: 'NOTIFICATION_EMAIL_AUTOMATED',
  },
  'paged-js': {
    pagedJsClientId: 'PAGED_JS_CLIENT_ID',
    pagedJsClientSecret: 'PAGED_JS_CLIENT_SECRET',
  },
}
