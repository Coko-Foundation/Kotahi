const config = require('config')

module.exports = (roles = []) => {
  const prettyRoles = config.journal.roles

  const roleText = roles.map(r => prettyRoles[r] || r).join(', ')
  return roleText
}
