const path = require('path')
const fs = require('fs-extra')
const { pick } = require('lodash')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const config = require('config')

const rules = require('./common-rules')

const context = path.resolve(__dirname, '..', 'app')
const contentBase = path.resolve(__dirname, '..', '_build', 'assets')

// can't use node-config in webpack so save whitelisted client config into the build and alias it below
const clientConfig = pick(config, config.publicKeys)
fs.ensureDirSync(contentBase)
const clientConfigPath = path.join(contentBase, 'client-config.json')
fs.writeJsonSync(clientConfigPath, clientConfig, { spaces: 2 })

const plugins = require('./plugins')

module.exports = webpackEnv => {
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'

  const serverProtocol = process.env.SERVER_PROTOCOL || 'http'
  const serverHost = process.env.SERVER_HOST || '0.0.0.0'
  const serverPort = process.env.SERVER_PORT || 3000
  const serverUrl = `${serverHost}${serverPort ? `:${serverPort}` : ''}`
  const serverUrlWithProtocol = `${serverProtocol}://${serverUrl}`

  const devServerHost = process.env.CLIENT_HOST || '0.0.0.0'
  const devServerPort = process.env.CLIENT_PORT || 4000

  return {
    devServer: {
      https: false,
      key: fs.readFileSync(path.join(__dirname, '../certs/private.key')),
      cert: fs.readFileSync(path.join(__dirname, '../certs/certificate.crt')),
      // contentBase: path.join(contentBase, 'public'),
      disableHostCheck: true,
      historyApiFallback: true,
      host: devServerHost,
      hot: true,
      port: devServerPort,
      publicPath: '/',
      watchOptions: {
        poll: true,
      },
      proxy: {
        '/api': serverUrlWithProtocol,
        '/auth': serverUrlWithProtocol,
        '/convertDocxToHTML': serverUrlWithProtocol,
        '/graphql': serverUrlWithProtocol,
        '/public': serverUrlWithProtocol,
        '/uploads': serverUrlWithProtocol,
        '/profiles': serverUrlWithProtocol,
        '/subscriptions': {
          target: `ws://${serverUrl}`,
          ws: true,
        },
      },
    },
    name: 'client application',
    target: 'web',
    mode: webpackEnv,
    context,
    entry: {
      app: isEnvDevelopment ? ['react-hot-loader/patch', './app'] : ['./app'],
    },
    output: {
      path: contentBase,
      publicPath: isEnvDevelopment ? '/' : '/assets/',
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
