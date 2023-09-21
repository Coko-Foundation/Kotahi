const passport = require('passport')
const OrcidStrategy = require('passport-orcid')
const config = require('config')
const { createJWT } = require('@coko/server')
const fetchUserDetails = require('./fetchUserDetails')

const CALLBACK_URL = '/auth/orcid/callback'

const orcidBackURL = config['pubsweet-client'].baseUrl

const addUserToAdminAndGroupManagerTeams = async (userId, groupId) => {
  // eslint-disable-next-line global-require
  const { Team, TeamMember } = require('@pubsweet/models')

  const groupManagerTeam = await Team.query().findOne({
    role: 'groupManager',
    objectId: groupId,
    objectType: 'Group',
  })

  const adminTeam = await Team.query().findOne({ role: 'admin', global: true })
  await TeamMember.query().insert({ userId, teamId: adminTeam.id })
  await TeamMember.query().insert({ userId, teamId: groupManagerTeam.id })
}

const addUserToUserTeam = async (userId, groupId) => {
  // eslint-disable-next-line global-require
  const { Team, TeamMember } = require('@pubsweet/models')

  const userTeam = await Team.query().findOne({
    role: 'user',
    objectId: groupId,
    objectType: 'Group',
  })

  await TeamMember.query().insert({ userId, teamId: userTeam.id })
}

module.exports = app => {
  // eslint-disable-next-line global-require
  const { Config, Group, User } = require('@pubsweet/models')

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
        passReqToCallback: true,
        ...config.get('auth-orcid'),
      },
      async (req, accessToken, refreshToken, params, profile, done) => {
        const urlParams = new URLSearchParams(req.query.state)
        const groupId = urlParams.get('group_id')

        // convert oauth response into a user object
        let user
        let firstLogin = false

        const activeConfig = await Config.getCached(groupId)

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
              await addUserToAdminAndGroupManagerTeams(user.id, groupId)

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

        done(null, { ...user, firstLogin, groupId })
      },
    ),
  )

  // handle sign in request
  app.get('/auth/orcid', (req, res, next) => {
    // Extract custom parameters from the request query
    const groupId = req.query.group_id

    const options = {
      state: `group_id=${groupId}`,
    }

    passport.authenticate('orcid', options)(req, res, next)
  })

  // handle oauth response
  app.get(
    CALLBACK_URL,
    passport.authenticate('orcid', {
      failureRedirect: '/login',
      session: false,
    }),
    async (req, res) => {
      const jwt = createJWT(req.user)
      const { groupId } = req.user

      const group = await Group.query().findOne({
        id: groupId,
        isArchived: false,
      })

      if (!group) {
        throw new Error(`Group not found or archived!`)
      }

      const urlFrag = `/${group.name}`

      const activeConfig = await Config.getCached(groupId)

      // Based on configuration User Management -> All users are assigned Group Manager and Admin roles flag
      if (activeConfig.formData.user.isAdmin)
        await addUserToAdminAndGroupManagerTeams(req.user.id, groupId)

      // eslint-disable-next-line global-require
      const { Team } = require('@pubsweet/models')

      const groupManagerTeam = await Team.query()
        .withGraphJoined('members')
        .select('role')
        .findOne({
          userId: req.user.id,
          objectId: groupId,
          objectType: 'Group',
          role: 'groupManager',
        })

      const isGroupManager = !!groupManagerTeam

      const userTeam = await Team.query()
        .withGraphJoined('members')
        .select('role')
        .findOne({
          userId: req.user.id,
          objectId: groupId,
          objectType: 'Group',
          role: 'user',
        })

      const isGroupUser = !!userTeam

      if (!isGroupUser) await addUserToUserTeam(req.user.id, groupId)

      let redirectionUrl

      if (req.user.firstLogin) {
        redirectionUrl = `${urlFrag}/profile`
      } else if (isGroupManager) {
        redirectionUrl = `${urlFrag}${activeConfig.formData.dashboard.loginRedirectUrl}`
      } else {
        redirectionUrl = `${urlFrag}/dashboard`
      }

      res.redirect(
        `${urlFrag}/login?token=${jwt}&redirectUrl=${redirectionUrl}`,
      )
    },
  )
}
