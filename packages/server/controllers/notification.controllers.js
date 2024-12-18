const Config = require('../models/config/config.model')
const Notification = require('../models/notification/notification.model')

const getGroupEvents = async groupId => {
  const config = await Config.query().findOne({ groupId })
  const { eventsConfig } = config.formData.notification

  const events = Object.keys(eventsConfig)
    .map(name => ({
      name,
      active: eventsConfig[name].active,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return events
}

const getEventNotifications = async (eventName, groupId) => {
  const { result: notifications } = await Notification.find({
    groupId,
    event: eventName,
  })

  return notifications
}

const setNotificationActive = async notificationId => {
  const notification = await Notification.findById(notificationId)
  const { active, recipient, emailTemplateId, subject } = notification
  const allowActivate = recipient && emailTemplateId && subject

  return !allowActivate
    ? notification
    : Notification.patchAndFetchById(notificationId, { active: !active })
}

const setEventActive = async (name, groupId) => {
  const config = await Config.query().findOne({ groupId })
  const formData = config.formData || {}
  const notification = { ...formData.notification }

  notification.eventsConfig[name].active =
    !notification.eventsConfig[name].active
  formData.notification = notification

  await Config.query()
    .findOne({ groupId })
    .patch({
      formData: JSON.stringify(formData),
    })

  return notification.eventsConfig[name].active
}

module.exports = {
  getEventNotifications,
  getGroupEvents,
  setNotificationActive,
  setEventActive,
}
