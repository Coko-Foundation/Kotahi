const { pick } = require('lodash')
const config = require('config')
const nodemailer = require('nodemailer')
const logger = require('@pubsweet/logger')
const User = require('pubsweet-server/src/models/User')
const Fragment = require('pubsweet-server/src/models/Fragment')
const Collection = require('pubsweet-server/src/models/Collection')
const authsome = require('pubsweet-server/src/helpers/authsome')
const AuthorizationError = require('pubsweet-server/src/errors/AuthorizationError')

const options = config.get('mailer.transport')
const transport = nodemailer.createTransport(options)

module.exports = app => {
  app.patch('/api/make-decision', async (req, res, next) => {
    try {
      const version = await Fragment.find(req.body.versionId)
      const project = await Collection.find(req.body.projectId)
      const authors = await Promise.all(version.owners.map(id => User.find(id)))

      const canViewVersion = await authsome.can(req.user, 'GET', version)
      const canPatchVersion = await authsome.can(req.user, 'PATCH', version)
      if (!canPatchVersion || !canViewVersion) throw new AuthorizationError()
      let versionUpdateData = { rev: version.rev, decision: req.body.decision }
      if (canPatchVersion.filter) {
        versionUpdateData = canPatchVersion.filter(versionUpdateData)
      }
      await version.updateProperties(versionUpdateData)

      let nextVersionData
      let projectUpdateData = { rev: project.rev }
      let message
      switch (version.decision.recommendation) {
        case 'accept':
          projectUpdateData.status = 'accepted'
          message = '<p>Your manuscript has been accepted</p>'
          break

        case 'reject':
          projectUpdateData.status = 'rejected'
          message = '<p>Your manuscript has been rejected</p>'
          break

        case 'revise': {
          projectUpdateData.status = 'revising'
          message = '<p>Revisions to your manuscript have been requested</p>'

          const cloned = pick(version, [
            'source',
            'metadata',
            'declarations',
            'suggestions',
            'files',
            'notes',
          ])
          nextVersionData = {
            fragmentType: 'version',
            created: new Date(),
            ...cloned,
            version: version.version + 1,
          }

          break
        }

        default:
          throw new Error('Unknown decision type')
      }

      message += version.decision.note.content

      let nextVersion
      let canViewNextVersion
      if (nextVersionData) {
        const canCreateVersion = await authsome.can(
          req.user,
          'POST',
          nextVersionData,
        )
        if (!canCreateVersion) throw new AuthorizationError()
        if (canCreateVersion.filter) {
          nextVersionData = canCreateVersion.filter(nextVersionData)
        }
        nextVersion = new Fragment(nextVersionData)
        canViewNextVersion = await authsome.can(req.user, 'GET', nextVersion)
      }

      const canViewProject = await authsome.can(req.user, 'GET', project)
      const canPatchProject = await authsome.can(req.user, 'PATCH', project)
      if (!canPatchProject || !canViewProject) throw new AuthorizationError()
      if (canPatchProject.filter) {
        projectUpdateData = canPatchProject.filter(projectUpdateData)
      }
      await project.updateProperties(projectUpdateData)

      await Promise.all([
        version.save(),
        project.save(),
        nextVersion && nextVersion.save(),
      ])

      const authorEmails = authors.map(user => user.email)
      logger.info(`Sending decision email to ${authorEmails}`)
      await transport.sendMail({
        from: config.get('mailer.from'),
        to: authorEmails,
        subject: 'Decision made',
        html: message,
      })

      res.send({
        version: canViewVersion.filter
          ? canViewVersion.filter(version)
          : version,
        project: canViewProject.filter
          ? canViewProject.filter(project)
          : project,
        nextVersion:
          canViewNextVersion && canViewNextVersion.filter
            ? canViewNextVersion.filter(nextVersion)
            : nextVersion,
      })
    } catch (err) {
      next(err)
    }
  })
}
