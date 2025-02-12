const passport = require('passport')
const OrcidStrategy = require('passport-orcid')
const config = require('config')

const {
  createJWT,
  useTransaction,
  clientUrl,
  serverUrl,
} = require('@coko/server')

const fetchUserDetails = require('./fetchUserDetails')

const seekEvent = require('../../services/notification.service')

const CALLBACK_URL = '/auth/orcid/callback'
const orcidBackURL = `${serverUrl}${CALLBACK_URL}`

const addUserToAdminAndGroupAdminTeams = async (
  userId,
  groupId,
  options = {},
) => {
  // eslint-disable-next-line global-require
  const Team = require('../../models/team/team.model')
  // eslint-disable-next-line global-require
  const TeamMember = require('../../models/teamMember/teamMember.model')

  const { trx } = options

  const groupAdminTeam = await Team.query(trx).findOne({
    role: 'groupAdmin',
    objectId: groupId,
    objectType: 'Group',
  })

  const adminTeam = await Team.query(trx).findOne({
    role: 'admin',
    global: true,
  })

  await TeamMember.query(trx).insert({ userId, teamId: adminTeam.id })
  await TeamMember.query(trx).insert({ userId, teamId: groupAdminTeam.id })
}

const addUserToGroupAdminTeam = async (userId, groupId, options = {}) => {
  // eslint-disable-next-line global-require
  const Team = require('../../models/team/team.model')
  // eslint-disable-next-line global-require
  const TeamMember = require('../../models/teamMember/teamMember.model')

  const { trx } = options

  const groupAdminTeam = await Team.query(trx).findOne({
    role: 'groupAdmin',
    objectId: groupId,
    objectType: 'Group',
  })

  await TeamMember.query(trx).insert({ userId, teamId: groupAdminTeam.id })
}

const addUserToUserTeam = async (userId, groupId) => {
  // eslint-disable-next-line global-require
  const Team = require('../../models/team/team.model')
  // eslint-disable-next-line global-require
  const TeamMember = require('../../models/teamMember/teamMember.model')

  const userTeam = await Team.query().findOne({
    role: 'user',
    objectId: groupId,
    objectType: 'Group',
  })

  await TeamMember.query().insert({ userId, teamId: userTeam.id })
}

module.exports = app => {
  /* eslint-disable global-require */
  const Config = require('../../models/config/config.model')
  const Group = require('../../models/group/group.model')
  const User = require('../../models/user/user.model')
  const Identity = require('../../models/identity/identity.model')
  const Team = require('../../models/team/team.model')
  /* eslint-enable global-require */

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
        callbackURL: orcidBackURL,
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
        let groupUsersCount

        try {
          usersCountString = (await User.query().count())[0].count
          groupUsersCount = await User.query()
            .joinRelated('teams')
            .where({ 'teams.objectId': groupId })
            .resultSize()
        } catch (err) {
          console.error(err)
        }

        // TODO: Update the user details on every login, asynchronously
        try {
          await useTransaction(async trx => {
            if (!user) {
              user = await User.query(trx).insert({
                username: params.name,
              })

              const identity = await Identity.query(trx).insert({
                identifier: params.orcid,
                oauth: { accessToken, refreshToken },
                type: 'orcid',
                isDefault: true,
                userId: user.id,
              })

              if (
                usersCountString === '0' ||
                activeConfig.formData.user.isAdmin
              ) {
                await addUserToAdminAndGroupAdminTeams(user.id, groupId, {
                  trx,
                })
              }

              // Do another request to the ORCID API for aff/name
              const userDetails = await fetchUserDetails(user, { trx })

              await identity.$query(trx).patchAndFetch({
                name: `${userDetails.firstName || ''} ${
                  userDetails.lastName || ''
                }`,
                aff: userDetails.institution || '',
              })

              await user.$query(trx).patchAndFetch({
                email: userDetails.email || null,
              })

              firstLogin = true
            } else if (groupUsersCount === 0) {
              const isAlreadyAdmin = await Team.query(trx)
                .withGraphJoined('members')
                .findOne({
                  userId: user.id,
                  objectId: null,
                  global: true,
                  role: 'admin',
                })

              if (!isAlreadyAdmin) {
                await addUserToAdminAndGroupAdminTeams(user.id, groupId, {
                  trx,
                })
              } else {
                await addUserToGroupAdminTeam(user.id, groupId, { trx })
              }
            }
          })
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

      const activeConfig = await Config.getCached(groupId)

      // Based on configuration User Management -> All users are assigned Group Manager and Admin roles flag
      if (activeConfig.formData.user.isAdmin)
        await addUserToAdminAndGroupAdminTeams(req.user.id, groupId)

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
      const urlFrag = `/${group.name}`

      if (req.user.firstLogin) {
        redirectionUrl = `${urlFrag}/profile`
      } else if (isGroupManager) {
        redirectionUrl = `${urlFrag}${activeConfig.formData.dashboard.loginRedirectUrl}`
      } else {
        redirectionUrl = `${urlFrag}/dashboard`
      }

      req.user.firstLogin &&
        seekEvent('user-first-login', {
          user: req.user,
          groupId,
        })

      res.redirect(
        `${clientUrl}${urlFrag}/login?token=${jwt}&redirectUrl=${redirectionUrl}`,
      )
    },
  )
}
