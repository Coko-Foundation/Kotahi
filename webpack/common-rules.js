const path = require('path')
const components = require('./components')

const modulesPath = path.join(__dirname, '..', 'node_modules')

module.exports = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules\/(?!pubsweet-)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          require.resolve('babel-preset-stage-2'),
          require.resolve('babel-preset-react'),
          [require.resolve('babel-preset-env'), {
            modules: false
          }]
        ],
        plugins: [
          'react-hot-loader/babel',
          require.resolve('babel-plugin-transform-class-properties')
        ],
        env: {
          production: {
            presets: ['babili']
          }
        }
      }
    }
  },
  {
    test: /\.png$/,
    use: {
      loader: 'url-loader'
    }
  },
  {
    test: /\.(woff|woff2|svg|eot|ttf)$/,
    use: {
      loader: 'url-loader',
      options: {
        prefix: 'font',
        limit: 1000
      }
    }
  },
  {
    test: /\.html$/,
    use: {
      loader: 'html-loader'
    }
  },
  {
    test: /\.json$/,
    use: {
      loader: 'json-loader'
    }
  },
  {
    test: /\.(css|scss)$/,
    exclude: /\.local\.s?css$/, // Exclude local styles from global
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader'
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: [modulesPath]
        }
      }
    ]
  },
  {
    test: /\.(css|scss)$/,
    include: /\.local\.s?css$/, // Local styles
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1
        }
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: [modulesPath]
        }
      }
    ]
  },
  {
    test: /\.(js)$/,
    enforce: 'pre',
    exclude: /node_modules\/(?!pubsweet-)/,
    use: {
      loader: 'string-replace-loader',
      options: {
        search: 'PUBSWEET_COMPONENTS',
        replace: '[' + components.frontend
          .map(component => `require('${component}')`)
          .join(', ') + ']' // TODO: move the brackets into pubsweet-client
      }
    }
  }
]
