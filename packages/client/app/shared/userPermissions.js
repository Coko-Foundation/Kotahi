const hasRole = (user, role, object) => {
  if (!user || !role || !object) return false

  const exists = object?.teams?.find(
    t =>
      t.role === role &&
      t.objectId === object.id &&
      !!t.members.find(m => m.user.id === user.id),
  )

  return !!exists
}

const isAuthor = (manuscript, user) => hasRole(user, 'author', manuscript)

const isCollaborator = (manuscript, user) =>
  hasRole(user, 'collaborator', manuscript)

const isAdmin = user => user.globalRoles.includes('admin')

const isCollaboratorWithWriteAccess = (manuscript, user) => {
  const { teams } = manuscript

  const manuscriptTeam = teams?.find(
    team => team.objectId === manuscript.id && team.role === 'collaborator',
  )

  const teamMember = manuscriptTeam?.members.find(
    member => member.user?.id === user.id,
  )

  return !!teamMember?.status && teamMember.status === 'write'
}

module.exports = {
  hasRole,
  isAuthor,
  isCollaborator,
  isCollaboratorWithWriteAccess,
  isAdmin,
}
