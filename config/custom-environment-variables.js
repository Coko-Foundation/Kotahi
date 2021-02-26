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
  },
  'pubsweet-server': {
    protocol: 'SERVER_PROTOCOL',
    host: 'SERVER_HOST',
    port: 'SERVER_PORT',
    secret: 'PUBSWEET_SECRET',
    db: {
      host: 'POSTGRES_HOST',
      port: 'POSTGRES_PORT',
      database: 'POSTGRES_DB',
      user: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
    },
  },
}
