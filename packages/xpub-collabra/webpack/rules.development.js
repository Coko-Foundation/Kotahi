const include = require('./babel-includes')
const stringReplaceRule = require('./string-replace')

module.exports = [
  stringReplaceRule,
  {
    oneOf: [
      // ES6 JS
      {
        test: /\.jsx?$/,
        include,
        loader: 'babel-loader',
        options: {
          presets: [
            [require('babel-preset-env'), { modules: false }],
            require('babel-preset-react'),
            require('babel-preset-stage-2'),
          ],
          plugins: [require('react-hot-loader/babel')],
        },
      },

      // CSS Modules
      {
        test: /\.local\.css$/,
        include,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]-[hash:base64:8]',
            },
          },
        ],
      },

      // SCSS Modules
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
              localIdentName: '[name]_[local]-[hash:base64:8]',
            },
          },
          'sass-loader',
        ],
      },

      // global CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      // global SCSS
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader', // TODO: importLoaders: 1?
          'sass-loader',
        ],
      },

      // files
      {
        exclude: [/\.jsx?$/, /\.html$/, /\.json$/],
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
]
