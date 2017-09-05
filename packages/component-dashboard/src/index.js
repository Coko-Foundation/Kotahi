module.exports = {
  frontend: {
    components: [
      () => require('./components')
    ],
    reducers: {
      dashboard: () => require('./redux/dashboard').default,
      manuscriptConversion: () => require('./redux/manuscriptConversion').default,
    }
  },
}
