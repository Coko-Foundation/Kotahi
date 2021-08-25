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
  },
  'publishing-webhook': {
    publishingWebhookUrl: 'PUBLISHING_WEBHOOK_URL',
    publishingWebhookSecret: 'PUBLISHING_WEBHOOK_SECRET',
  },
  s3: {
    accessKeyId: 'S3_ACCESS_KEY_ID',
    secretAccessKey: 'S3_ACCESS_KEY_SECRET',
    endpoint: 'S3_ENDPOINT',
    region: 'S3_REGION',
    bucket: 'S3_BUCKET',
  },
}
