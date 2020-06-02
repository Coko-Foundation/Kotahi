const config = require('config')

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = (opts = {}) => {
  const plugins = []

  if (opts.hmr) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (opts.html) {
    plugins.push(
      new HtmlWebpackPlugin({
        title: 'SimpleJ - open journals',
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${opts.env}"`,
    }),
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

  plugins.push(
    new CopyWebpackPlugin([{ from: '../public' }]),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CompressionPlugin(),
    new BundleAnalyzerPlugin(),
  )

  return plugins
}
