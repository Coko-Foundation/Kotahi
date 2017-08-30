module.exports = {
  frontend: {
    components: [
      () => require('./components')
    ],
    reducers: {
      login: () => require('./redux/login'),
      signup: () => require('./redux/signup'),
      currentUser: () => require('./redux/currentUser')
    }
  },
}
