const path = require('path')
const nodeExternals = require('webpack-node-externals')

const include = [
  path.join(__dirname, 'src'),
  /xpub-[^/]+\/src/,
]

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
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
            include,
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', { modules: false }],
                'react',
                'stage-2'
              ],
              cacheDirectory: true,
            },
          },

          // CSS modules
          {
            test: /\.local\.css$/,
            include,
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

          // SCSS modules
          {
            test: /\.local\.scss$/,
            include,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  importLoaders: 1
                }
              },
              'sass-loader'
            ],
          }
        ]
      }
    ]
  }
}
