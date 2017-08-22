process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    library: 'xpub-authentication',
    libraryTarget: 'commonjs2'
  },
  devtool: 'cheap-module-source-map',
  externals: [nodeExternals({
    whitelist: [/\.(?!js$).{1,5}$/i]
  })],
  resolve: {
    symlinks: false
  },
  module: {
    rules: [
      {
        oneOf: [
          // ES6 modules
          {
            test: /\.js$/,
            include: [
              path.join(__dirname, 'src'),
              /xpub-[^/]+\/src/,
            ],
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  modules: false,
                }],
                'react',
                'stage-2'
              ],
              cacheDirectory: true,
            },
          },

          // CSS modules
          {
            test: /\.local\.css$/,
            include: [
              path.join(__dirname, 'src'),
              /xpub-[^/]+\/src/,
            ],
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                }
              }
            ],
          },

          // CSS
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ],
          },

          // Files
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            }
          }
        ]
      }
    ]
  }
}
