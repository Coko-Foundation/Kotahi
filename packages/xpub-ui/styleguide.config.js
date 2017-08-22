module.exports = {
  title: 'xpub-ui style guide',
  styleguideComponents: {
    StyleGuideRenderer: require.resolve('xpub-styleguide/src/components/StyleGuideRenderer'),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper')
  },
  context: {
    faker: 'faker',
  },
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
  sections: [
    {
      name: 'Atoms',
      components: 'src/atoms/*.js'
    },
    {
      name: 'Molecules',
      components: 'src/molecules/*.js'
    }
  ]
}
