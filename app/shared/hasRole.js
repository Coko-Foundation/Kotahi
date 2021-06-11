const hasRole = (obj, role) => {
  /* eslint-disable-next-line no-underscore-dangle */
  const currentRoles = (obj && obj._currentRoles) || []

  // When multiple roles are provided it acts as an 'OR'
  if (Array.isArray(role)) {
    return role.some(r => currentRoles.includes(r))
  }

  return currentRoles.includes(role)
}

export default hasRole
