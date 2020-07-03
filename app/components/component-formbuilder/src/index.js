module.exports = {
  frontend: {
    components: [() => require('./components')],
    actions: () => ({
      getForm: require('./redux/FormBuilder').getForm,
    }),
    reducers: {
      forms: () => require('./redux/FormBuilder').default,
    },
  },
  server: () => require('./server/formRequestBackend'),
}
