const { dbCleaner } = require('pubsweet-server/test')
const fixtures = require('./fixtures')
const Identity = require('../src/identity')
const User = require('../src/user')

describe('Identity', () => {
  beforeEach(async () => {
    await dbCleaner()
  })

  it('can create a user with a default local identity', async () => {
    const user = await new User(fixtures.user).save()
    const defaultIdentity = await new Identity({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: true,
    }).save()

    const savedUser = await User.find(user.id, { eager: 'defaultIdentity' })
    expect(savedUser.defaultIdentity).toEqual(defaultIdentity)
  })

  it('can create a user with a local and a default oauth identity', async () => {
    let user = await new User(fixtures.user).save()

    const localIdentity = await new Identity({
      ...fixtures.localIdentity,
      userId: user.id,
    }).save()

    const externalIdentity = await new Identity({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: true,
    }).save()

    user = await User.find(user.id, { eager: '[identities, defaultIdentity]' })

    expect(user.identities).toContainEqual(localIdentity)
    expect(user.identities).toContainEqual(externalIdentity)
    expect(user.defaultIdentity).toEqual(externalIdentity)
  })

  it('user can not have more than one default identities', async () => {
    const user = await new User(fixtures.user).save()

    await new Identity({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: true,
    }).save()

    const externalIdentity = new Identity({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: true,
    }).save()

    await expect(externalIdentity).rejects.toThrow('violates unique constraint')
  })

  it('can have multiple non-default identities (isDefault = false)', async () => {
    const user = await new User(fixtures.user).save()

    await new Identity({
      ...fixtures.localIdentity,
      userId: user.id,
      isDefault: false,
    }).save()

    await new Identity({
      ...fixtures.externalIdentity,
      userId: user.id,
      isDefault: false,
    }).save()

    const foundUser = await User.find(user.id, { eager: 'identities' })
    expect(foundUser.identities).toHaveLength(2)
  })
})
