module.exports = {
  title: 'xpub review style guide',
  styleguideComponents: {
    StyleGuideRenderer: require.resolve(
      'xpub-styleguide/src/components/StyleGuideRenderer',
    ),
    Wrapper: require.resolve('xpub-styleguide/src/components/Wrapper'),
  },
  context: {
    faker: 'faker',
  },
  skipComponentsWithoutExample: true,
  serverPort: 6065,
  theme: {
    fontFamily: {
      base: '"Fira Sans", sans-serif',
    },
    color: {
      link: 'cornflowerblue',
    },
  },
  sections: [
    {
      name: 'Reviewers',
      components: 'src/components/reviewers/*.js',
    },
    {
      name: 'Review',
      components: 'src/components/review/*.js',
    },
    {
      name: 'Decision',
      components: 'src/components/decision/*.js',
    },
    {
      name: 'Metadata',
      components: 'src/components/metadata/*.js',
    },
    {
      name: 'Tabs',
      components: 'src/components/tabs/*.js',
    },
  ],
}
