module.exports = {
  context: {
    faker: 'faker',
  },
  sections: [
    {
      content: 'docs/colors.md',
      name: 'Colors',
    },
    {
      content: 'docs/fonts.md',
      name: 'Fonts',
    },
    {
      components: 'src/atoms/*.js',
      name: 'Atoms',
    },
    {
      components: 'src/molecules/*.js',
      name: 'Molecules',
    },
  ],
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
  title: 'xpub-ui style guide',
}
