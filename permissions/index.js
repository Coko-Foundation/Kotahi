module.exports = (user, operation, project, version) => {
  return true // TODO

  // switch (operation) {
  //   case 'publish':
  //     return version.decision &&
  //       !version.published &&
  //       user.admin
  //
  //   case 'decision':
  //     return version.reviews &&
  //       !version.decision &&
  //       version.roles.editor.find(role => role.user.id === user.id)
  //
  //   case 'accept_invitation':
  //     return version.invitations.reviewer
  //       .filter(invitation => !invitation.accepted)
  //       .find(invitation => invitation.user.email === user.email)
  // }
}
