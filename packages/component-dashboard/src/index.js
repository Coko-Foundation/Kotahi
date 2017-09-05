module.exports = {
  frontend: {
    components: [
      () => require('./components')
    ],
    reducers: {
      manuscriptConversion: () => require('./redux/manuscriptConversion').default,
    }
  },
}
