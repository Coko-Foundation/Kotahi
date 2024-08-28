const Team = require('../models/team/team.model')
const TeamMember = require('../models/teamMember/teamMember.model')
const User = require('../models/user/user.model')
const Message = require('../models/message/message.model')
const Manuscript = require('../models/manuscript/manuscript.model')
const NotificationDigest = require('../models/notificationDigest/notificationDigest.model')

const {
  updateAlertsUponTeamUpdate,
} = require('../server/model-task/src/taskCommsUtils')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../server/model-channel/src/channelCommsUtils')

const { evictFromCacheByPrefix } = require('../server/querycache')

const createTeam = async input => {
  // TODO Only the relate option appears to be used by insertGraphAndFetch, according to Objection docs?
  const options = {
    relate: ['members.user'],
    unrelate: ['members.user'],
    allowUpsert: '[members]',
    eager: '[members.[user.teams]]',
  }

  await Promise.all(
    input.members.map(async member => {
      await addUserToManuscriptChatChannel({
        manuscriptId: input.objectId,
        userId: member.user.id,
        type: 'all',
      })
      await addUserToManuscriptChatChannel({
        manuscriptId: input.objectId,
        userId: member.user.id,
        type: 'editorial',
      })
    }),
  )

  return Team.query().insertGraphAndFetch(input, options)
}

const updateTeam = async (id, input) => {
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')
  const existing = await Team.query().select('role').findById(id)

  if (
    existing &&
    ['editor', 'handlingEditor', 'seniorEditor'].includes(existing.role)
  ) {
    const existingMemberIds = (
      await TeamMember.query().select('userId').where({ teamId: id })
    ).map(m => m.userId)

    const newMemberIds = input.members.map(m => m.user.id)

    const membersAdded = newMemberIds.filter(
      userId => !existingMemberIds.includes(userId),
    )

    const membersRemoved = existingMemberIds.filter(
      userId => !newMemberIds.includes(userId),
    )

    const { objectId } = await Team.query().select('objectId').findById(id)

    await updateAlertsUponTeamUpdate(objectId, membersAdded, membersRemoved)

    const channels = await Manuscript.relatedQuery('channels').for(objectId)

    await Promise.all(
      membersRemoved.map(async userId => {
        // Check if the user has any messages in the channels before removing them from the channelMember
        const hasPostedToChannel = await Message.query()
          .where({ userId })
          .whereIn(
            'channelId',
            channels.map(channel => channel.id),
          )
          .first()

        if (!hasPostedToChannel) {
          await removeUserFromManuscriptChatChannel({
            manuscriptId: objectId,
            userId,
            type: 'all',
          })
          await removeUserFromManuscriptChatChannel({
            manuscriptId: objectId,
            userId,
            type: 'editorial',
          })
          const pathStrings = channels.map(channel => `chat/${channel.id}`)
          await NotificationDigest.query()
            .delete()
            .where({ user_id: userId })
            .whereIn('path_string', pathStrings)
        }
      }),
    )

    await Promise.all(
      input.members.map(async member => {
        await addUserToManuscriptChatChannel({
          manuscriptId: objectId,
          userId: member.user.id,
          type: 'all',
        })
        await addUserToManuscriptChatChannel({
          manuscriptId: objectId,
          userId: member.user.id,
          type: 'editorial',
        })
      }),
    )
  }

  return Team.query().upsertGraphAndFetch(
    { id, ...input },
    {
      relate: ['members.user'],
      unrelate: ['members.user'],
      eager: 'members.user.teams', // TODO This appears to be ignored, according to Objection documentation?
    },
  )
}

const updateTeamMember = async (id, input) => {
  return TeamMember.query().updateAndFetchById(id, JSON.parse(input))
}

const updateCollaborativeTeamMembers = async (manuscriptId, input) => {
  const collaborativeReviewerTeam = await Team.query().findOne({
    objectId: manuscriptId,
    role: 'collaborativeReviewer',
  })

  await TeamMember.query()
    .where({ teamId: collaborativeReviewerTeam.id })
    .update(JSON.parse(input))

  return TeamMember.query().where({
    teamId: collaborativeReviewerTeam.id,
  })
}

const userTeams = async userId => {
  return User.relatedQuery('teams').for(userId)
}

module.exports = {
  createTeam,
  updateTeam,
  updateTeamMember,
  updateCollaborativeTeamMembers,
  userTeams,
}
