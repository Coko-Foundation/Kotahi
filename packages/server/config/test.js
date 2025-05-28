module.exports = {
  pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
  uploads: 'uploads',
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  },
}
