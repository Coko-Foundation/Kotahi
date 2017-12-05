module.exports = {
  context: {
    faker: 'faker',
  },
  serverPort: 6066,
  skipComponentsWithoutExample: true,
  styleguideComponents: {
    StyleGuideRenderer: require.resolve(
      'xpub-styleguide/src/components/StyleGuideRenderer',
    ),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper'),
  },
  theme: {
    color: {
      link: 'cornflowerblue',
    },
    fontFamily: {
      base: '"Fira Sans", sans-serif',
    },
  },
  title: 'xpub-edit style guide',
}
