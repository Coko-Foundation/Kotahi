const path = require('path')
const config = require('config')

const dotenvPath = path.resolve(`.env.${config.util.getEnv('NODE_ENV')}`)
require('dotenv').config({ path: dotenvPath })

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const gqlApi = require('./graphql')
// const index = require('./routes/index')
// const api = require('./routes/api')
const logger = require('@pubsweet/logger')
// const sse = require('pubsweet-sse')

// const _ = require('lodash/fp')
const STATUS = require('http-status-codes')
const registerComponents = require('pubsweet-server/src/register-components') // TODO: Fix import

// Wax Collab requirements
const WebSocket = require('ws')
const wsUtils = require('./wax-collab/server-util.js')
// const cookie = require('cookie')
const EventEmitter = require('events')

const configureApp = app => {
  const models = require('@pubsweet/models')
  const authsome = require('pubsweet-server/src/helpers/authsome') // TODO: Fix import

  app.locals.models = models

  app.use(bodyParser.json({ limit: '50mb' }))
  morgan.token('graphql', ({ body }, res, type) => {
    if (!body.operationName) return ''
    switch (type) {
      case 'query':
        return body.query.replace(/\s+/g, ' ')
      case 'variables':
        return JSON.stringify(body.variables)
      case 'operation':
      default:
        return body.operationName
    }
  })
  app.use(
    morgan(config.get('pubsweet-server').morganLogFormat || 'combined', {
      stream: logger.stream,
    }),
  )

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(helmet())
  app.use(express.static(path.resolve('.', '_build')))

  app.use('/public', express.static(path.resolve(__dirname, '../public')))

  if (config.has('pubsweet-server.uploads')) {
    app.use(
      '/uploads',
      express.static(path.resolve(config.get('pubsweet-server.uploads'))),
    )
  }
  // Passport strategies
  app.use(passport.initialize())
  const authentication = require('pubsweet-server/src/authentication')

  // Register passport authentication strategies
  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.locals.passport = passport
  app.locals.authsome = authsome

  registerComponents(app)

  // REST API
  // app.use('/api', api)

  // GraphQL API
  gqlApi(app)

  // Serve the index page for front end
  // app.use('/', index)
  app.use('/healthcheck', (req, res) => res.send('All good!'))

  app.use((err, req, res, next) => {
    // development error handler, will print stacktrace
    if (app.get('env') === 'development' || app.get('env') === 'test') {
      logger.error(err)
      logger.error(err.stack)
    }

    if (err.name === 'ValidationError') {
      return res.status(STATUS.BAD_REQUEST).json({ message: err.message })
    } else if (err.name === 'ConflictError') {
      return res.status(STATUS.CONFLICT).json({ message: err.message })
    } else if (err.name === 'AuthorizationError') {
      return res.status(err.status).json({ message: err.message })
    } else if (err.name === 'AuthenticationError') {
      return res.status(STATUS.UNAUTHORIZED).json({ message: err.message })
    }
    return res
      .status(err.status || STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message })
  })

  // Set up a separate websocket for Wax-Collab
  const wss = new WebSocket.Server({ noServer: true })
  wss.on('connection', (conn, req) => wsUtils.setupWSConnection(conn, req))

  // Actions to perform when the HTTP server starts listening
  app.onListen = async server => {
    const { addSubscriptions } = require('./subscriptions')

    // Proxy server to address:
    // https://github.com/apollographql/subscriptions-transport-ws/issues/751
    const serverProxy = new EventEmitter()
    // server.on('listening', serverProxy.emit.bind(serverProxy));
    // server.on('error', serverProxy.emit.bind(serverProxy));
    server.on('upgrade', (request, socket, head, ...rest) => {
      if (request.url === '/subscriptions') {
        serverProxy.emit('upgrade', request, socket, head, ...rest)
      } else {
        let user = null
        if (request.headers.cookie) {
          // const cookies = cookie.parse(request.headers.cookie)
          // const user = cookies.user_identifier
        }
        // TODO: Do real auth for Wax-collab
        user = 'test' // shortcut

        if (!user) {
          // console.log('Failed to authenticate', user)
          socket.destroy()
          return
        }
        wss.handleUpgrade(request, socket, head, ws => {
          wss.emit('connection', ws, request)
        })
      }
    })

    // Add GraphQL subscriptions
    addSubscriptions(serverProxy)

    // Manage job queue
    const { startJobQueue } = require('pubsweet-server/src/jobs')
    await startJobQueue()
  }

  // Actions to perform when the server closes
  app.onClose = async () => {
    const wait = require('waait')
    const { stopJobQueue } = require('pubsweet-server/src/jobs')
    await stopJobQueue()
    return wait(500)
  }

  return app
}

module.exports = configureApp
