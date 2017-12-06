module.exports = {
  frontend: {
    components: [() => require('./components')],
    reducers: {
      currentUser: () => require('./redux/currentUser').default,
      login: () => require('./redux/login').default,
      signup: () => require('./redux/signup').default,
    },
  },
}
