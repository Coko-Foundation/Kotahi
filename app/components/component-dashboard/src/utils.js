export const getLatestVersion = manuscript => {
  if (
    !manuscript ||
    !manuscript.manuscriptVersions ||
    manuscript.manuscriptVersions.length <= 0
  )
    return manuscript

  return manuscript.manuscriptVersions[0]
}

export const getNumVersions = manuscript => {
  return (manuscript.manuscriptVersions?.length ?? 0) + 1
}

export const getRoles = (m, userId) =>
  m.teams
    .filter(t => t.members.some(member => member.user.id === userId))
    .map(t => t.role)
