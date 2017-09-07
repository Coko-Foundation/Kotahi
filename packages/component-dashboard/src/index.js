module.exports = {
  frontend: {
    components: [
      () => require('./components')
    ],
    reducers: {
      conversion: () => require('./redux/conversion').default,
    }
  },
}
