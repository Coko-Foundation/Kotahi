import faker from 'faker'
import { login } from './pageObjects'
import { startServer, setup } from './helpers/setup'

fixture('Guest user')
  .before(startServer)
  .beforeEach(async () => {
    await setup()
  })

// test('Signup journey', async t => {
//   const user = {
//     username: faker.internet.domainWord(),
//     email: faker.internet.exampleEmail(),
//     password: faker.internet.password(),
//   }

//   // cannot log in
//   await login
//     .doLogin(user.username, user.password)
//     .expect(login.alert.innerText)
//     .contains('Unauthorized')
// })

test('testing...', async t => {
  await t.expect(true).eql(true)
})
