const Notification = require('../../../models/notification/notification.model')

const {
  getGroupEvents,
  setNotificationActive,
  setEventActive,
  getEventNotifications,
} = require('../../../controllers/notification.controllers')

const getEventsResolver = async (_, __, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return getGroupEvents(groupId)
}

const eventNotificationsResolver = async ({ name }, _, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return getEventNotifications(name, groupId)
}

const createNotificationResolver = async (_, { input }, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return Notification.insert({ ...input, groupId, active: true })
}

const updateNotificationResolver = async (_, { id, input }) => {
  return Notification.patchAndFetchById(id, { ...input, active: true })
}

const deleteNotificationResolver = async (_, { id }) => {
  await Notification.deleteById(id)
  return id
}

const setNotificationActiveResolver = async (_, { id }) => {
  return setNotificationActive(id)
}

const setEventActiveResolver = async (_, { name }, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return setEventActive(name, groupId)
}

const resolvers = {
  Query: {
    events: getEventsResolver,
  },
  Mutation: {
    createNotification: createNotificationResolver,
    updateNotification: updateNotificationResolver,
    deleteNotification: deleteNotificationResolver,
    setNotificationActive: setNotificationActiveResolver,
    setEventActive: setEventActiveResolver,
  },
  Event: {
    notifications: eventNotificationsResolver,
  },
}

module.exports = resolvers
