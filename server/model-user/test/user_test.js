const { dbCleaner } = require('pubsweet-server/test')
const fixtures = require('./fixtures')
const User = require('../src/user')

describe('User', () => {
  beforeEach(async () => {
    await dbCleaner()
  })

  it('validates passwords correctly after saving to db', async () => {
    const user = new User(fixtures.user)
    await user.save()

    const savedUser = await User.findByUsername(user.username)
    expect(typeof savedUser).toBe('object')

    const shouldBeValid = await savedUser.validPassword(fixtures.user.password)
    expect(shouldBeValid).toEqual(true)

    const shouldBeInvalid = await savedUser.validPassword('wrongpassword')
    expect(shouldBeInvalid).toEqual(false)
  })

  it('raises an error if trying to save a user with a non-unique username', async () => {
    const user = new User(fixtures.user)
    const otherUserFixture = fixtures.otherUser
    otherUserFixture.username = fixtures.user.username
    const duplicateUser = new User(otherUserFixture)

    await user.save()
    await expect(duplicateUser.save()).rejects.toThrow(
      'violates unique constraint',
    )

    expect.hasAssertions()
  })

  it('raises an error if trying to save a user with a non-unique email', async () => {
    const user = new User(fixtures.user)
    const otherUserFixture = fixtures.otherUser
    otherUserFixture.email = fixtures.user.email
    const duplicateUser = new User(otherUserFixture)

    await user.save()
    await expect(duplicateUser.save()).rejects.toThrow(
      'violates unique constraint',
    )

    expect.hasAssertions()
  })

  it('uses custom JSON serialization', async () => {
    const user = new User(fixtures.user)
    await user.save()

    const savedUser = await User.findByUsername(user.username)
    expect(savedUser).toHaveProperty('username', user.username)
    expect(savedUser).toHaveProperty('passwordHash')

    const stringifiedUser = JSON.parse(JSON.stringify(savedUser))
    expect(stringifiedUser).toHaveProperty('username', user.username)
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })

  it('uses custom JSON serialization in an array', async () => {
    const users = [
      { username: 'user1', email: 'user-1@example.com', password: 'foo1' },
      { username: 'user2', email: 'user-2@example.com', password: 'foo2' },
      { username: 'user3', email: 'user-3@example.com', password: 'foo3' },
    ]

    await Promise.all(users.map(user => new User(user).save()))

    const savedUsers = await User.all()

    const savedUser = savedUsers[2]
    expect(savedUser).toHaveProperty('username')
    expect(savedUser).toHaveProperty('passwordHash')

    const stringifiedUsers = JSON.parse(JSON.stringify(savedUsers))
    const stringifiedUser = stringifiedUsers[2]

    expect(stringifiedUser).toHaveProperty('username', savedUser.username)
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })

  it('finds a list of users', async () => {
    const users = [
      { username: 'user1', email: 'user-1@example.com', password: 'foo1' },
      { username: 'user2', email: 'user-2@example.com', password: 'foo2' },
      { username: 'user3', email: 'user-3@example.com', password: 'foo3' },
    ]

    await Promise.all(users.map(user => new User(user).save()))

    const items = await User.findByField('email', 'user-1@example.com')

    expect(items).toHaveLength(1)
    expect(items[0]).toBeInstanceOf(User)
  })

  it('finds a single user by field', async () => {
    const users = [
      { username: 'user1', email: 'user-1@example.com', password: 'foo1' },
      { username: 'user2', email: 'user-2@example.com', password: 'foo2' },
      { username: 'user3', email: 'user-3@example.com', password: 'foo3' },
    ]

    await Promise.all(users.map(user => new User(user).save()))

    const item = await User.findOneByField('email', 'user-1@example.com')

    expect(item).toBeInstanceOf(User)

    expect(item).toEqual(
      expect.objectContaining({
        username: 'user1',
        email: 'user-1@example.com',
      }),
    )
  })

  it('fails password verification if passwordHash is not present', async () => {
    const fixtureWithoutPassword = Object.assign({}, fixtures.user)
    delete fixtureWithoutPassword.password

    const user = await new User(fixtureWithoutPassword).save()

    const validPassword1 = await user.validPassword(undefined)
    expect(validPassword1).toEqual(false)
    const validPassword2 = await user.validPassword(null)
    expect(validPassword2).toEqual(false)
    const validPassword3 = await user.validPassword('somethingfunky')
    expect(validPassword3).toEqual(false)
  })
})
