const { pick } = require('lodash')
const config = require('config')
const passport = require('passport')
const logger = require('@pubsweet/logger')
const emailer = require('@pubsweet/component-send-email')

const authsome = require('pubsweet-server/src/helpers/authsome')
const { AuthorizationError } = require('@pubsweet/errors')

const authBearer = passport.authenticate('bearer', { session: false })

const { User, Fragment, Team, Collection } = require('@pubsweet/models')

module.exports = app => {
  app.patch('/api/make-invitation', authBearer, async (req, res, next) => {
    try {
      const version = await Fragment.find(req.body.versionId)
      const project = await Collection.find(req.body.projectId)

      const reviewer = await Promise.all(
        project.reviewers
          .filter(user => user.user === req.body.reviewerId)
          .map(({ user }) => User.find(user)),
      )

      const currentAndUpdate = {
        current: version,
        update: {
          id: req.body.versionId,
          reviewers: req.body.reviewers,
        },
      }

      const canViewVersion = await authsome.can(req.user, 'GET', version)

      const canPatchVersion = await authsome.can(
        req.user,
        'PATCH',
        currentAndUpdate,
      )

      if (!canPatchVersion || !canViewVersion) throw new AuthorizationError()
      let versionUpdateData = req.body.reviewers

      if (canPatchVersion.filter) {
        versionUpdateData = canPatchVersion.filter(versionUpdateData)
      }

      await version.updateProperties({ reviewers: versionUpdateData })
      await version.save()

      logger.info(`Sending invitation email to ${reviewer[0].email}`)

      let message = `<p>${version.metadata.title}</p>`
      message += `<p>${version.metadata.abstract}</p>`
      message += `<p><a href='${
        config.get('pubsweet-server').baseUrl
      }'>Click here to navigate to the Dashboard</a></p>`

      emailer
        .send({
          from: config.get('mailer.from'),
          to: reviewer[0].email,
          subject: 'Review Invitation',
          html: message,
        })
        .catch(err => {
          logger.error(err.response)
        })

      const currentAndUpdateProject = {
        current: project,
        update: req.body,
      }

      const canViewProject = await authsome.can(req.user, 'GET', project)

      const canPatchProject = await authsome.can(
        req.user,
        'PATCH',
        currentAndUpdateProject,
      )

      if (!canPatchProject || !canViewProject) throw new AuthorizationError()

      await Team.query().upsertGraphAndFetch(
        {
          role: 'reviewer',
          name: 'Reviewer',
          manuscriptId: version.id,
          members: [{ user: { id: reviewer[0].id } }],
        },
        { relate: true },
      )

      res.send({
        version: canViewVersion.filter
          ? canViewVersion.filter(version)
          : version,
        project: canViewProject.filter
          ? canViewProject.filter(project)
          : project,
      })
    } catch (err) {
      next(err)
    }
  })

  app.patch('/api/make-decision', authBearer, async (req, res, next) => {
    try {
      const version = await Fragment.find(req.body.versionId)
      const project = await Collection.find(req.body.projectId)
      const authors = await Promise.all(version.owners.map(id => User.find(id)))

      let currentAndUpdate = {
        current: version,
        update: {
          id: req.body.versionId,
          decision: req.body.decision,
        },
      }

      const canViewVersion = await authsome.can(req.user, 'GET', version)

      const canPatchVersion = await authsome.can(
        req.user,
        'PATCH',
        currentAndUpdate,
      )

      if (!canPatchVersion || !canViewVersion) throw new AuthorizationError()
      let versionUpdateData = { decision: req.body.decision }

      if (canPatchVersion.filter) {
        versionUpdateData = canPatchVersion.filter(versionUpdateData)
      }

      await version.updateProperties(versionUpdateData)

      let nextVersionData
      let projectUpdateData = {}
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
            'collections',
            'owners',
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
        const canCreateVersion = await authsome.can(req.user, 'POST', {
          path: '/collections/:collectionId/fragments',
          collection: project,
          fragment: nextVersionData,
        })

        if (!canCreateVersion) throw new AuthorizationError()

        if (canCreateVersion.filter) {
          nextVersionData = canCreateVersion.filter(nextVersionData)
        }

        nextVersion = new Fragment(nextVersionData)

        canViewNextVersion = await authsome.can(req.user, 'GET', nextVersion)
      }

      currentAndUpdate = { current: project, update: req.body }

      const canViewProject = await authsome.can(req.user, 'GET', project)

      const canPatchProject = await authsome.can(
        req.user,
        'PATCH',
        currentAndUpdate,
      )

      if (!canPatchProject || !canViewProject) throw new AuthorizationError()

      if (canPatchProject.filter) {
        projectUpdateData = canPatchProject.filter(projectUpdateData)
      }

      await project.updateProperties(projectUpdateData)

      await Promise.all([
        version.save(),
        nextVersion && nextVersion.save(),
        nextVersion && project.addFragment(nextVersion),
        project.save(),
      ])

      const authorEmails = authors.map(user => user.email)
      logger.info(`Sending decision email to ${authorEmails}`)
      emailer
        .send({
          from: config.get('mailer.from'),
          to: authorEmails,
          subject: 'Decision made',
          html: message,
        })
        .catch(err => {
          logger.error(err.response)
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
