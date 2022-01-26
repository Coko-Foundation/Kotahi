const config = require('config')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin

const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = (opts = {}) => {
  const plugins = []

  if (opts.hmr) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (opts.html) {
    plugins.push(
      new HtmlWebpackPlugin({
        title: 'Kotahi - open journals',
        template: '../app/index.ejs', // Load a custom template
      }),
    )
  }

  if (opts.extractText) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    )
  }

  if (opts.noEmitOnErrors) {
    plugins.push(new webpack.NoEmitOnErrorsPlugin())
  }

  plugins.push(
    new webpack.EnvironmentPlugin([
      'NODE_ENV',
      'SERVER_PROTOCOL',
      'SERVER_HOST',
      'SERVER_PORT',
      'CLIENT_PROTOCOL',
      'CLIENT_HOST',
      'CLIENT_PORT',
      'PUBLIC_CLIENT_PROTOCOL',
      'PUBLIC_CLIENT_HOST',
      'PUBLIC_CLIENT_PORT',
      'USE_SANDBOXED_ORCID',
      'INSTANCE_NAME',
      'MANUSCRIPTS_TABLE_COLUMNS',
      'MANUSCRIPTS_TABLE_FIRST_COLUMN_WIDTH',
      'DISPLAY_SHORTID_AS_IDENTIFIER',
    ]),
  )

  // put dynamically required modules into the build
  if (config.validations) {
    plugins.push(
      new webpack.ContextReplacementPlugin(/./, __dirname, {
        [config.authsome.mode]: config.authsome.mode,
      }),
    )
  } else {
    plugins.push(
      new webpack.ContextReplacementPlugin(/./, __dirname, {
        [config.authsome.mode]: config.authsome.mode,
      }),
    )
  }

  if (isDevelopment) {
    plugins.push(new CopyWebpackPlugin([{ from: '../public', to: 'assets/' }]))
  } else {
    plugins.push(new CopyWebpackPlugin([{ from: '../public' }]))
  }

  plugins.push(
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CompressionPlugin(),
    // new BundleAnalyzerPlugin(),
  )

  return plugins
}
