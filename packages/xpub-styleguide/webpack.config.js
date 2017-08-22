process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    library: 'xpub-styleguide',
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
            ],
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
            include: [
              path.join(__dirname, 'src'),
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
          }
        ]
      }
    ]
  }
}
