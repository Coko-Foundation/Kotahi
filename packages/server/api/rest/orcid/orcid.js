const passport = require('passport')

const {
  createOrcidStrategy,
  handleOrcidOAuthResponse,
} = require('../../../controllers/orcid.controllers')

module.exports = app => {
  passport.use(createOrcidStrategy())

  // handle sign in request
  app.get('/auth/orcid', (req, res, next) => {
    const groupId = req.query.group_id
    const options = { state: `group_id=${groupId}` }
    passport.authenticate('orcid', options)(req, res, next)
  })

  // handle oauth response
  app.get(
    '/auth/orcid/callback',
    passport.authenticate('orcid', {
      failureRedirect: '/login',
      session: false,
    }),
    async (req, res) => {
      // req.user is the full user object created in the orcid strategy callback
      const redirectUrl = await handleOrcidOAuthResponse(req.user)
      res.redirect(redirectUrl)
    },
  )
}
