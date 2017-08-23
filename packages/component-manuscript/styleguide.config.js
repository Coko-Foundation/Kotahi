module.exports = {
  title: 'xpub-manuscript style guide',
  styleguideComponents: {
    StyleGuideRenderer: require.resolve('xpub-styleguide/src/components/StyleGuideRenderer'),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper')
  },
  context: {
    faker: 'faker'
  },
  skipComponentsWithoutExample: true,
  webpackConfig: require('./webpack.config.js'),
  serverPort: 6063,
  theme: {
    fontFamily: {
      base: '"Fira Sans", sans-serif'
    },
    color: {
      link: 'cornflowerblue'
    }
  }
}
