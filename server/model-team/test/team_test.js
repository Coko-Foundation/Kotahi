process.env.NODE_CONFIG = `{"pubsweet":{
  "components":[
    "@pubsweet/model-user",
    "@pubsweet/model-team",
    "@pubsweet/model-fragment"
  ]
}}`

const Team = require('../src/team')
const { model: User } = require('@pubsweet/model-user')
const { dbCleaner } = require('pubsweet-server/test')

const createTeamWithMember = async () => {
  const user = await new User({
    email: 'some@example.com',
    username: 'test',
  }).save()

  const team = await Team.query().upsertGraphAndFetch(
    {
      name: 'Test',
      role: 'testRole',
      members: [{ user: { id: user.id } }],
    },
    { relate: true },
  )

  return { user, team }
}

describe('Team', () => {
  beforeEach(async () => {
    await dbCleaner()
  })

  it('has updated set when created', async () => {
    const team = await new Team({
      name: 'Test',
      role: 'globalSeniorEditor',
    }).save()
    expect(team.role).toEqual('globalSeniorEditor')
    const now = new Date().toISOString()
    expect(team.updated.toISOString()).toHaveLength(now.length)
  })

  it('can be saved and found and deleted', async () => {
    const team = await new Team({ name: 'Test', role: 'testRole' }).save()
    expect(team.name).toEqual('Test')

    const foundTeam = await Team.find(team.id)
    expect(foundTeam.name).toEqual('Test')

    await foundTeam.delete()

    async function tryToFind() {
      await Team.find(foundTeam.id)
    }
    await expect(tryToFind()).rejects.toThrow('Object not found')
  })

  it('can have some members', async () => {
    const newTeam = (await createTeamWithMember()).team
    const team = await Team.query()
      .findById(newTeam.id)
      .eager('members')

    expect(team.members).toHaveLength(1)
  })

  it('deletes memberships after team is deleted', async () => {
    const { team, user } = await createTeamWithMember()

    let foundUser = await User.query()
      .findById(user.id)
      .eager('teams')

    expect(foundUser.teams).toHaveLength(1)

    await Team.query().deleteById(team.id)

    foundUser = await User.query()
      .findById(user.id)
      .eager('teams')

    expect(foundUser.teams).toHaveLength(0)
  })

  it('creates team and related objects with one call', async () => {
    const user = await new User({
      email: 'some@example.com',
      username: 'test',
    }).save()

    const team = await Team.query().upsertGraphAndFetch(
      {
        role: 'test',
        name: 'My team',
        objectId: '5989b23c-356b-4ae9-bee5-bbd11f29028b',
        objectType: 'fragment',
        members: [
          {
            user: { id: user.id },
            alias: {
              email: 'someemail',
              aff: 'someaff',
              name: 'somename',
            },
            status: 'invited',
          },
        ],
      },
      {
        relate: true,
        unrelate: true,
      },
    )

    expect(team.members).toHaveLength(1)
    expect(team.members[0].id).toBeDefined()
    expect(team.members[0].alias.id).toBeDefined()
    expect(team.members[0].user.id).toBe(user.id)

    const userWithTeams = await User.query()
      .findById(user.id)
      .eager('teams')
    expect(userWithTeams.teams[0].id).toBe(team.id)
  })
})
