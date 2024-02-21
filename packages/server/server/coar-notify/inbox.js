const models = require('@pubsweet/models')
const { processNotification, validateIPs } = require('./coar-notify')

module.exports = async app => {
  app.post('/api/coar/inbox/:group', async (req, res) => {
    const payload = req.body
    const groupName = req.params.group
    const group = await models.Group.query().findOne({ name: groupName })
    const requestIP = req.socket.localAddress.split(':').pop()

    if (!group) {
      return res.status(404).send({ message: 'Group not found' })
    }

    if (!(await validateIPs(requestIP, group))) {
      return res.status(403).send({ message: 'Unauthorized Request' })
    }

    try {
      const result = await processNotification(group, payload, req)
      return res.status(result.status).send({ message: result.message })
    } catch (error) {
      console.error(error)
      return res.status(500).send({ message: 'Failed to create notification.' })
    }
  })
}
