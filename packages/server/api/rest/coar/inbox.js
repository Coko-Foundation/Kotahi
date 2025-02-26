const { logger } = require('@coko/server')

const { Group } = require('../../../models')

const {
  processNotification,
  validateIPs,
} = require('../../../controllers/coar/coar.controllers')

module.exports = async app => {
  app.post('/api/coar/inbox/:group', async (req, res) => {
    const payload = req.body
    const groupName = req.params.group
    const requestIP = req.socket.localAddress.split(':').pop()

    const group = await Group.query().findOne({ name: groupName })

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
      logger.error(error)
      return res.status(500).send({ message: 'Failed to create notification.' })
    }
  })
}
