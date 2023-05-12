const passport = require('passport')
const OrcidStrategy = require('passport-orcid')
const config = require('config')
const { createJWT } = require('@coko/server')
const fetchUserDetails = require('./fetchUserDetails')

const CALLBACK_URL = '/auth/orcid/callback'

const orcidBackURL = config['pubsweet-client'].baseUrl

const addUserToAdminAndGroupManagerTeams = async userId => {
  // eslint-disable-next-line global-require
  const { Team, TeamMember } = require('@pubsweet/models')

  const groupId = null // TODO get groupId when we have multitenancy

  const groupManagerTeam = await Team.query().findOne({
    role: 'groupManager',
    objectId: groupId,
  })

  const adminTeam = await Team.query().findOne({ role: 'admin', global: true })
  await TeamMember.query().insert({ userId, teamId: adminTeam.id })
  await TeamMember.query().insert({ userId, teamId: groupManagerTeam.id })
}

module.exports = app => {
  // eslint-disable-next-line global-require
  const { User } = require('@pubsweet/models')
  // eslint-disable-next-line global-require
  const Config = require('../config/src/config')

  // set up OAuth client
  passport.use(
    new OrcidStrategy(
      {
        sandbox:
          config['auth-orcid'].useSandboxedOrcid &&
          config['auth-orcid'].useSandboxedOrcid.toLowerCase() === 'true',
        scope: '/authenticate',
        // this works here only with webpack dev server's proxy (ie. clientUrl/auth -> serverUrl/auth)
        // or when the server and client are served from the same url
        callbackURL: orcidBackURL + CALLBACK_URL,
        ...config.get('auth-orcid'),
      },
      async (accessToken, refreshToken, params, profile, done) => {
        // convert oauth response into a user object
        let user
        let firstLogin = false
        const activeConfig = await Config.query().first() // To be replaced with group based active config in future

        try {
          user = await User.query()
            .joinRelated('identities')
            .where('identities.identifier', params.orcid)
            .where('identities.type', 'orcid')
            .throwIfNotFound()
            .first()
        } catch (err) {
          // swallow not found error
          if (err.name !== 'NotFoundError') {
            done(err)
            return
          }
        }

        let usersCountString

        try {
          usersCountString = (await User.query().count())[0].count
        } catch (err) {
          console.error(err)
        }

        // TODO: Update the user details on every login, asynchronously
        try {
          if (!user) {
            user = await new User({
              username: params.name,
              defaultIdentity: {
                identifier: params.orcid,
                oauth: { accessToken, refreshToken },
                type: 'orcid',
                isDefault: true,
              },
            }).saveGraph()

            if (usersCountString === '0' || activeConfig.formData.user.isAdmin)
              await addUserToAdminAndGroupManagerTeams(user.id)

            // Do another request to the ORCID API for aff/name
            const userDetails = await fetchUserDetails(user)
            user.defaultIdentity.name = `${userDetails.firstName || ''} ${
              userDetails.lastName || ''
            }`
            user.defaultIdentity.aff = userDetails.institution || ''
            user.email = userDetails.email || null
            user.saveGraph()
            firstLogin = true
          }
        } catch (err) {
          done(err)
          return
        }

        done(null, { ...user, firstLogin })
      },
    ),
  )

  // handle sign in request
  app.get('/auth/orcid', passport.authenticate('orcid'))

  // handle oauth response
  app.get(
    CALLBACK_URL,
    passport.authenticate('orcid', {
      failureRedirect: '/login',
      session: false,
    }),
    async (req, res) => {
      const jwt = createJWT(req.user)
      const activeConfig = await Config.query().first() // To be replaced with group based active config in future
      // eslint-disable-next-line global-require
      const { Team } = require('@pubsweet/models')
      const groupId = null // TODO set groupId once we have multitenancy

      const groupManagerTeam = await Team.query()
        .withGraphJoined('members')
        .select('role')
        .findOne({
          userId: req.user.id,
          objectId: groupId,
          role: 'groupManager',
        })

      const isGroupManager = !!groupManagerTeam
      let redirectionUrl

      // TODO redirectionURL prefix `/kotahi` to be replaced with value from group based active config in the future
      if (req.user.firstLogin) {
        redirectionUrl = '/kotahi/profile'
      } else if (isGroupManager) {
        redirectionUrl = `/kotahi${activeConfig.formData.dashboard.loginRedirectUrl}`
      } else {
        redirectionUrl = '/kotahi/dashboard'
      }

      res.redirect(`/login?token=${jwt}&redirectUrl=${redirectionUrl}`)
    },
  )
}
