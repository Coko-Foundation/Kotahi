const path = require('path')

module.exports = {
  title: 'xpub-ui style guide',
  styleguideComponents: {
    StyleGuideRenderer: path.join(__dirname, 'lib/styleguide/StyleGuideRenderer'),
    Wrapper: path.join(__dirname, 'lib/styleguide/Wrapper'),
  },
  context: {
    faker: 'faker',
  },
  components: './src/*.js',
  skipComponentsWithoutExample: true,
  webpackConfig: require('./webpack.config.js'),
  theme: {
    fontFamily: {
      base: '"Fira Sans", sans-serif'
    },
    color: {
      link: 'cornflowerblue'
    }
  },
}
