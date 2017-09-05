module.exports = {
  frontend: {
    components: [
      () => require('./components')
    ],
    reducers: {
      login: () => require('./redux/login').default,
      signup: () => require('./redux/signup').default,
      currentUser: () => require('./redux/currentUser').default
    }
  },
}
