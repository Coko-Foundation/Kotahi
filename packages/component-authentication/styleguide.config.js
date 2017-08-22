module.exports = {
  title: 'xpub authentication style guide',
  styleguideComponents: {
    StyleGuideRenderer: require.resolve('xpub-styleguide/src/components/StyleGuideRenderer'),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper')
  },
  components: './src/components/*.js',
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
