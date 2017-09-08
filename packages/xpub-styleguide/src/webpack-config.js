process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const path = require('path')
// const nodeExternals = require('webpack-node-externals')

module.exports = dir => {
  const include = [
    path.join(dir, 'src'),
    /pubsweet-[^/]+\/src/,
    /xpub-[^/]+\/src/,
  ]

  return {
    entry: './src/index.js',
    output: {
      filename: 'index.js',
      path: path.join(dir, 'dist')
    },
    devtool: 'cheap-module-source-map',
    // externals: [nodeExternals({
    //   whitelist: [/\.(?!js$).{1,5}$/i]
    // })],
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
                  ['env', {modules: false}],
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
                    // sourceMap: true,
                    localIdentName: '[name]_[local]-[hash:base64:8]',
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
                    importLoaders: 1,
                    // sourceMap: true,
                    localIdentName: '[name]_[local]-[hash:base64:8]',
                  }
                },
                'sass-loader'
              ],
            },

            // global CSS
            {
              test: /\.css$/,
              use: [
                'style-loader',
                'css-loader'
              ],
            },

            // global SCSS
            {
              test: /\.scss$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                  }
                },
                'sass-loader'
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
}