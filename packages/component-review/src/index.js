module.exports = {
  frontend: {
    components: [() => require('./components')],
    actions: () => ({ makeDecision: require('./redux').makeDecision }),
    reducers: {
      makeDecision: () => require('./redux').default,
    },
  },
}
