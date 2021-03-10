const path = require('path')
const fs = require('fs-extra')
const config = require('config')
const { pick } = require('lodash')

const rules = require('./common-rules')

const contentBase = path.resolve(__dirname, '..', '_build', 'assets')

// Loads environment variables from e.g. .env.development, same as server/app.js
const dotenvPath = path.resolve(`.env.${config.util.getEnv('NODE_ENV')}`)
require('dotenv').config({ path: dotenvPath })

// can't use node-config in webpack so save whitelisted client config into the build and alias it below
const clientConfig = pick(config, config.publicKeys)
fs.ensureDirSync(contentBase)
const clientConfigPath = path.join(contentBase, 'client-config.json')
fs.writeJsonSync(clientConfigPath, clientConfig, { spaces: 2 })

const plugins = require('./plugins')

module.exports = webpackEnv => {
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'

  const serverProtocol = process.env.SERVER_PROTOCOL
  const serverHost = process.env.SERVER_HOST
  const serverPort = process.env.SERVER_PORT
  const serverUrl = `${serverHost}${serverPort ? `:${serverPort}` : ''}`
  const serverUrlWithProtocol = `${serverProtocol}://${serverUrl}`

  const devServerHost = process.env.CLIENT_HOST
  const devServerPort = process.env.CLIENT_PORT

  return {
    context: path.join(__dirname, '..', 'app'),
    devServer: {
      // contentBase: path.join(contentBase, 'public'),
      disableHostCheck: true,
      historyApiFallback: true,
      host: devServerHost,
      hot: true,
      port: devServerPort,
      proxy: {
        '/api': serverUrlWithProtocol,
        '/auth': serverUrlWithProtocol,
        '/convertDocxToHTML': serverUrlWithProtocol,
        '/graphql': serverUrlWithProtocol,
        '/public': serverUrlWithProtocol,
        '/static/uploads': serverUrlWithProtocol,
        '/static/profiles': serverUrlWithProtocol,
        '/subscriptions': {
          target: `ws://${serverUrl}`,
          ws: true,
        },
      },
      publicPath: '/',
    },
    name: 'client application',
    target: 'web',
    mode: webpackEnv,
    entry: {
      app: isEnvDevelopment ? ['react-hot-loader/patch', './app'] : ['./app'],
    },
    output: {
      path: contentBase,
      publicPath: '/',
      filename: isEnvProduction
        ? 'js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'js/bundle.js',
      // TODO: remove this when upgrading to webpack 5
      futureEmitAssets: true,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isEnvProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'js/[name].chunk.js',
    },
    devtool: 'cheap-module-source-map',
    module: {
      rules,
    },
    resolve: {
      alias: {
        'wax-prosemirror-themes': path.resolve(__dirname, '../app/theme'),
        'xpub-journal': path.resolve(
          __dirname,
          '../app/components/xpub-journal',
        ),
        joi: 'joi-browser',
        config: clientConfigPath,
      },
      extensions: ['.js', '.jsx', '.json', '.scss'],
      enforceExtension: false,
    },
    plugins: plugins({
      hmr: isEnvDevelopment,
      html: true,
      noEmitOnErrors: true,
      extractText: isEnvProduction,
      env: webpackEnv,
    }),
  }
}
