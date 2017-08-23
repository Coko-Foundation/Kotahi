module.exports = {
  title: 'xpub-edit style guide',
  styleguideComponents: {
    StyleGuideRenderer: require.resolve('xpub-styleguide/src/components/StyleGuideRenderer'),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper')
  },
  serverPort: 6065,
  skipComponentsWithoutExample: true,
  webpackConfig: require('./webpack.config.js'),
  context: {
    faker: 'faker'
  },
  theme: {
    fontFamily: {
      base: '"Fira Sans", sans-serif'
    },
    color: {
      link: 'cornflowerblue'
    }
  }
}
