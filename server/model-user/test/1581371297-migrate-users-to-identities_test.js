process.env.NODE_CONFIG = `{"pubsweet":{
  "components":[
    "@pubsweet/model-user",
  ]
}}`

const { User } = require('@pubsweet/models')
const { dbCleaner } = require('pubsweet-server/test')
const migrate = require('@pubsweet/db-manager/src/commands/migrate')

describe('Users to Identities migration', () => {
  it('has successfuly created new default identities', async () => {
    await dbCleaner({ to: '1580908536-add-identities.sql' })

    const user1 = await new User({
      email: 'some1@example.com',
      username: 'user1',
      password: 'test1',
    }).save()

    const user2 = await new User({
      email: 'some2@example.com',
      username: 'user2',
      password: 'test2',
    }).save()

    // Do the migration
    await migrate({ to: '1581371297-migrate-users-to-identities.js' })

    const user1after = await User.find(user1.id, {
      eager: '[identities,defaultIdentity]',
    })
    const user2after = await User.find(user2.id, {
      eager: '[identities,defaultIdentity]',
    })

    expect(user1after.defaultIdentity).toBeTruthy()
    expect(user1after.identities).toHaveLength(1)
    expect(await user1after.validPassword('test1')).toBe(true)

    expect(user2after.defaultIdentity).toBeTruthy()
    expect(user2after.identities).toHaveLength(1)
    expect(await user2after.validPassword('test2')).toBe(true)
  })
})
