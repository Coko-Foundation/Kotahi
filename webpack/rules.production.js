const ExtractTextPlugin = require('extract-text-webpack-plugin')
const include = require('./babel-includes')
const stringReplaceRule = require('./string-replace')

const resolve = (type, entry) => {
  if (typeof entry === 'string') {
    return require.resolve(`babel-${type}-${entry}`)
  }
  return [require.resolve(`babel-${type}-${entry[0]}`), entry[1]]
}

const resolvePreset = entry => resolve('preset', entry)

module.exports = [
  stringReplaceRule,
  {
    oneOf: [
      // ES6 JS
      {
        test: /\.js$|\.jsx$/,
        include,
        loader: 'babel-loader',
        options: {
          presets: [['env', { modules: false }], 'react', 'stage-2'].map(
            resolvePreset,
          ),
          plugins: [require.resolve('react-hot-loader/babel')],
        },
      },

      {
        exclude: /node_modules/,
        test: /\.(graphql|gql)$/,
        loader: 'graphql-tag/loader',
      },

      // CSS Modules
      {
        test: /\.local\.css$/,
        include,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]_[local]-[hash:base64:8]',
              },
            },
          ],
        }),
      },

      // SCSS Modules
      {
        test: /\.local\.scss$/,
        include,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
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
        }),
      },

      // global CSS
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }),
      },

      // global SCSS
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', // TODO: importLoaders: 1?
            'sass-loader',
          ],
        }),
      },

      // files
      {
        exclude: [/\.jsx?$/, /\.mjs$/, /\.html$/, /\.json$/],
        loader: 'file-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
]
