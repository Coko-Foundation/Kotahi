const NotificationDigest = require('../../../models/notificationDigest/notificationDigest.model')
const NotificationUserOption = require('../../../models/notificationUserOption/notificationUserOption.model')

const tryGetObjectIdFromPath = path => {
  if (!path.length) return null
  const lastNodeOfPath = path[path.length - 1]
  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      lastNodeOfPath,
    )
  )
    return lastNodeOfPath
  return null
}

const resolvers = {
  Query: {
    notificationOption: async (_, { path }, ctx) => {
      if (!ctx.user) {
        throw new Error(
          'Cannot retrieve notificationOption for an unregistered user',
        )
      }

      const groupId = ctx.req.headers['group-id']
      const objectId = tryGetObjectIdFromPath(path)

      const notificationOption = await NotificationUserOption.query().findOne({
        userId: ctx.user,
        path: `{${path.join(',')}}`,
        groupId,
        objectId,
      })

      return notificationOption
    },
  },
  Mutation: {
    updateNotificationOption: async (_, { path, option }, ctx) => {
      if (!ctx.user)
        throw new Error(
          'Cannot updateNotificationOption for an unregistered user',
        )

      if (!['off', 'inherit', '30MinSummary'].includes(option)) {
        throw new Error(
          `Unrecognized option '${option}' passed to updateNotificationOption`,
        )
      }

      const groupId = ctx.req.headers['group-id']
      const userId = ctx.user
      const objectId = tryGetObjectIdFromPath(path)

      // Find the existing record based on userId, path, and groupId
      const existingOption = await NotificationUserOption.query()
        .where({ userId, groupId })
        .whereRaw('path = ?', `{${path.join(',')}}`)
        .first()

      if (existingOption) {
        return NotificationUserOption.query().patchAndFetchById(
          existingOption.id,
          { option },
        )
      }

      // If no existing record, create a new one
      // eslint-disable-next-line no-return-await
      return await NotificationUserOption.query().insert({
        userId,
        path,
        groupId,
        option,
        objectId,
      })
    },
    reportUserIsActive: async (_, { path }, context) => {
      if (path) {
        const pathString = path.join('/')

        await NotificationDigest.query().delete().where({
          userId: context.user,
          pathString,
          actioned: false,
        })
      }
    },
  },
}

const typeDefs = `
  type NotificationUserOption {
    id: ID!
    created: DateTime!
    updated: DateTime
    userId: ID!
    objectId: ID
    path: [String!]!
    option: String!
    groupId: ID!
  }

  extend type Query {
    notificationOption(path: [String!]!): NotificationUserOption
  }

  extend type Mutation {
    updateNotificationOption(path: [String!]!, option: String!): NotificationUserOption!
    reportUserIsActive(path: [String!]!): Boolean
  }
`

module.exports = { typeDefs, resolvers }
