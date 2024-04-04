export const isReviewerInvitation = (emailTemplateId, emailTemplates) =>
  emailTemplates.find(et => et.id === emailTemplateId)?.emailTemplateType ===
  'reviewerInvitation'

const getTeamUsers = (teamType, teams) => {
  const filteredTeams = teams.filter(
    team =>
      team.role === teamType ||
      (teamType === 'editor' && team.role.endsWith('Editor')),
  )

  const result = new Set()
  filteredTeams.forEach(team =>
    team.members.forEach(m => {
      if (!['invited', 'rejected'].includes(m.status)) result.add(m.user.id)
    }),
  )
  return [...result]
}

/** Returns an array of the registered users who will receive the email. Ignores unregistered users. */
const getRecipientUserIds = (recipientUser, recipientType, task, teams) => {
  if (recipientUser) return [recipientUser.id]

  if (['editor', 'reviewer', 'author'].includes(recipientType))
    return getTeamUsers(recipientType, teams)

  if (recipientType === 'assignee') {
    if (['editor', 'reviewer', 'author'].includes(task.assigneeType))
      return getTeamUsers(task.assigneeType, teams)
    if (task.assigneeUserId) return [task.assigneeUserId]
    return []
  }

  return []
}

/** Based on the supplied params, decide whether this is a review invitation to registered user(s)
 * and if so, add those users as reviewers.
 * @param recipientUser If this user object is null, we'll attempt to find the recipient via recipientType
 */
export const ifReviewInviteThenAssignRecipientsAsReviewers = async (
  emailTemplateId,
  recipientType,
  recipientUser,
  task,
  manuscript,
  emailTemplates,
  addReviewer,
) => {
  if (isReviewerInvitation(emailTemplateId, emailTemplates)) {
    const recipients = getRecipientUserIds(
      recipientUser,
      recipientType,
      task,
      manuscript.teams,
    )

    await Promise.all(
      recipients.map(r =>
        addReviewer({
          variables: {
            userId: r,
            manuscriptId: manuscript.id,
          },
        }),
      ),
    )
  }
}
