module.exports = async (on, config) => {
  on('task', {})

  // important: return the changed config
  return config
}
