const path = require('path')
const webpack = require('webpack')
const ThemePlugin = require('pubsweet-theme-plugin')
const config = require('../config/dev')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = [
  {
    // The configuration for the client
    name: 'app',
    target: 'web',
    context: path.join(__dirname, '..', 'app'),
    entry: {
      app: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        './app'
      ]
    },
    output: {
      path: path.join(__dirname, '..', '_build', 'assets'),
      filename: '[name].js',
      publicPath: '/assets/'
    },
    devtool: 'cheap-module-source-map',
    module: {
      rules: require('./rules')
    },
    resolve: {
      symlinks: false,
      modules: [
        path.resolve(__dirname, '..'),
        path.resolve(__dirname, '..', 'node_modules'),
        'node_modules'
      ],
      alias: {
        joi: 'joi-browser'
      },
      plugins: [new ThemePlugin(config['pubsweet-client'].theme)],
      extensions: ['.js', '.jsx', '.json', '.scss'],
      enforceExtension: false
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('dev'),
          'REDUXLOG_OFF': process.env.REDUXLOG_OFF
        }
      }),
      new webpack.ProvidePlugin({
        'CONFIG': path.resolve(__dirname, '..', 'config', 'dev.js')
      }),
      new CopyWebpackPlugin([
        { from: '../static' }
      ])
    ],
    node: {
      fs: 'empty',
      __dirname: true
    }
  }
]
