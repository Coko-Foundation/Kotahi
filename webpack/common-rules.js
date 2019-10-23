const babelIncludes = require('./babel-includes')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = [
  { test: /\.tsx?$/, loader: 'ts-loader' },
  {
    test: /\.js$|\.jsx$/,
    loader: 'babel-loader',
    query: {
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react',
      ],
      plugins: [
        require.resolve('react-hot-loader/babel'),
        '@babel/plugin-proposal-class-properties',
        // 'transform-decorators-legacy',
      ],
      env: {
        production: {
          /* bug requires mangle:false https://github.com/babel/minify/issues/556#issuecomment-339751209 */
          presets: [['minify', { builtIns: false, mangle: false }]],
        },
      },
    },
    include: babelIncludes,
  },
  { test: /\.png|\.jpg$/, loader: 'url-loader' },
  {
    test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
    loader: [
      {
        loader: 'url-loader',
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  { test: /\.html$/, loader: 'html-loader' },
  {
    test: /\.css$|\.scss$/,
    exclude: /\.local\.s?css$/, // Exclude local styles from global
    loader: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
    ],
  },
  {
    test: /\.css$|\.scss$/,
    include: /\.local\.s?css/, // Local styles
    loader: [
      {
        loader: 'style-loader',
      },
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: process.env.NODE_ENV === 'development',
        },
      },
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          localIdentName: '[name]_[local]-[hash:base64:8]',
        },
      },
    ],
  },
]
