const hasRole = (obj, role) => {
  const currentRoles = (obj && obj._currentRoles) || []

  // When multiple roles are provided it acts as an 'OR'
  if (Array.isArray(role)) {
    return role.some(r => currentRoles.includes(r))
  }
  return currentRoles.includes(role)
}

export default hasRole
