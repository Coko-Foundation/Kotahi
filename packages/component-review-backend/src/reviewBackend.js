const { pick } = require('lodash')
const config = require('config')
const nodemailer = require('nodemailer')
const logger = require('@pubsweet/logger')
const User = require('pubsweet-server/src/models/User')
const Fragment = require('pubsweet-server/src/models/Fragment')
const Collection = require('pubsweet-server/src/models/Collection')

const options = config.get('mailer.transport')
const transport = nodemailer.createTransport(options)

module.exports = app => {
  app.patch('/api/make-decision', async (req, res, next) => {
    try {
      const version = await Fragment.find(req.body.versionId)
      const project = await Collection.find(req.body.projectId)
      const authors = await Promise.all(version.owners.map(id => User.find(id)))

      version.decision = req.body.decision
      await version.save()

      let nextVersion
      let message
      switch (version.decision.recommendation) {
        case 'accept':
          project.status = 'accepted'
          message = 'Your manuscript has been accepted'
          break

        case 'reject':
          project.status = 'rejected'
          message = 'Your manuscript has been rejected'
          break

        case 'revise': {
          project.status = 'revising'
          message = 'Revisions to your manuscript have been requested'

          const cloned = pick(version, [
            'source',
            'metadata',
            'declarations',
            'suggestions',
            'files',
            'notes',
          ])
          nextVersion = new Fragment({
            fragmentType: 'version',
            created: new Date(),
            ...cloned,
            version: version.version + 1,
          })
          await nextVersion.save()

          break
        }

        default:
          throw new Error('Unknown decision type')
      }

      await project.save()

      const authorEmails = authors.map(user => user.email)
      logger.info(`Sending decision email to ${authorEmails}`)
      await transport.sendMail({
        from: config.get('mailer.from'),
        to: authorEmails,
        subject: 'Decision made',
        text: message,
      })

      res.send({ version, project, nextVersion })
    } catch (err) {
      next(err)
    }
  })
}
