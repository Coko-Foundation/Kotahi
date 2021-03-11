module.exports = {
  'auth-orcid': {
    useSandboxedOrcid: 'USE_SANDBOXED_ORCID',
    clientID: 'ORCID_CLIENT_ID',
    clientSecret: 'ORCID_CLIENT_SECRET',
  },
  'pubsweet-client': {
    protocol: 'CLIENT_PROTOCOL',
    host: 'PUBLIC_CLIENT_HOST',
    port: 'CLIENT_PORT',
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
}
