process.env.NODE_ENV = 'production'
process.env.BABEL_ENV = 'production'

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const rules = require('./common-rules')
const resolve = require('./common-resolve')

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
    resolve,
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
    ],
    node: {
      fs: 'empty',
      __dirname: true
    }
  }
]
