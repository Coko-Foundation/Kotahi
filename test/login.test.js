import faker from 'faker'
import config from 'config'

import { startServer, setup } from './helpers/setup'
import { login, submission } from './pageObjects'
//import login from './pageObjects/login'

let user

fixture('Log in test')
  .before(startServer)
  .beforeEach(async () => {
    const result = await setup()
    user = result.userData
  })

test('Log in', async t => {
  await login
    .doLogin(user.username, user.password)
    .expect(submission.noSubmissionsText)
    .eql('Nothing to do at the moment. Please upload a document')
})
