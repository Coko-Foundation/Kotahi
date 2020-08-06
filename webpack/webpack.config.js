const path = require('path')
const fs = require('fs-extra')
const config = require('config')
const { pick } = require('lodash')

const rules = require('./common-rules')

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

  return {
    devServer: {
      port: 4000,
      hot: true,
      contentBase: path.join(contentBase, 'public'),
      publicPath: '/',
      proxy: {
        '/subscriptions': {
          target: 'ws://localhost:3000',
          ws: true,
        },
        '/convertDocxToHTML': 'http://localhost:3000',
        '/api': 'http://localhost:3000',
        '/auth': 'http://localhost:3000',
        '/graphql': 'http://localhost:3000',
        '/static/uploads': 'http://localhost:3000',
        '/static/profiles': 'http://localhost:3000',
        '/public': 'http://localhost:3000',
      },
      historyApiFallback: true,
    },
    name: 'client application',
    target: 'web',
    mode: webpackEnv,
    context: path.join(__dirname, '..', 'app'),
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
