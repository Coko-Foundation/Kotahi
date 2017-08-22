const styleguideComponents = require('xpub-styleguide')

module.exports = {
  title: 'xpub authentication style guide',
  styleguideComponents,
  components: './src/*.js',
  skipComponentsWithoutExample: true,
  webpackConfig: require('./webpack.config.js'),
  serverPort: 6061,
  theme: {
    fontFamily: {
      base: '"Fira Sans", sans-serif'
    },
    color: {
      link: 'cornflowerblue'
    }
  }
}
