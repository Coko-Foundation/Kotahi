const path = require('path')

module.exports = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['stage-2', 'es2015', 'react', ['env', {
          "targets": {
            'node': 7,
            "browsers": ["last 2 versions"]
          }
        }]]
      }
    }
  },
  {
    test: /\.(woff|woff2|svg|eot|ttf)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          prefix: 'font',
          limit: 1000
        }
      }
    ]
  },
  {
    test: /\.(css|scss)$/,
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader'
      },
      {
        loader: 'sass-loader'
      }
    ]
  }
]
