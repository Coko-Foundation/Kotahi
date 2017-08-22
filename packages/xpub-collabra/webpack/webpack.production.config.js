process.env.NODE_ENV = "production"
process.env.BABEL_ENV = "production"

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ThemePlugin = require('pubsweet-theme-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const config = require('../config/production')
const rules = require('./common-rules')

module.exports = [
  {
    // The configuration for the client
    name: 'app',
    target: 'web',
    context: path.join(__dirname, '..', 'app'),
    entry: {
      app: ['./app']
    },
    output: {
      path: path.join(__dirname, '..', '_build', 'assets'),
      filename: '[name].[hash].js',
      publicPath: '/assets/'
    },
    module: {
      rules
    },
    resolve: {
      // symlinks: false,
      // modules: [
      //   path.resolve(__dirname, '..'),
      //   path.join(__dirname, '..', 'node_modules'),
      //   'node_modules'
      // ],
      alias: {
        joi: 'joi-browser'
      },
      extensions: ['.js', '.jsx', '.json', '.scss'],
      plugins: [new ThemePlugin(config['pubsweet-client'].theme)]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'xpub',
        template: '../app/index.ejs', // Load a custom template
        inject: 'body' // Inject all scripts into the body
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.ProvidePlugin({
        CONFIG: path.resolve(__dirname, '..', 'config', 'production.js')
      }),
      new ExtractTextPlugin('styles/main.css'),
      new CopyWebpackPlugin([
        { from: '../static' }
      ]),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/
      })
    ],
    node: {
      fs: 'empty',
      __dirname: true
    }
  }
]
