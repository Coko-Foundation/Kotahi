process.env.NODE_CONFIG = `{"pubsweet":{
  "components":[
    "@pubsweet/model-user",
    "@pubsweet/model-team",
    "@pubsweet/model-fragment"
  ]
}}`

const { model: User } = require('@pubsweet/model-user')
const { model: Fragment } = require('@pubsweet/model-fragment')

const { dbCleaner, api } = require('pubsweet-server/test')

const { fixtures } = require('@pubsweet/model-user/test')
const authentication = require('pubsweet-server/src/authentication')

const Team = require('../src/team')

describe('Team queries', () => {
  let token
  let user

  const whereQuery = async where => {
    const { body } = await api.graphql.query(
      `query($where: TeamWhereInput) {
          teams(where: $where) {
            name
            object {
              objectId
              objectType
            }
            members {
              user {
                id
              }
            }
          }
        }`,
      {
        where,
      },
      token,
    )
    return body
  }

  beforeEach(async () => {
    await dbCleaner()
    user = await new User(fixtures.user).save()
    token = authentication.token.create(user)
  })

  it("lists a user's teams", async () => {
    await Team.query().upsertGraphAndFetch(
      {
        role: 'test',
        name: 'Test',
        members: [{ user: { id: user.id } }],
      },
      { relate: true, unrelate: true },
    )

    const { body } = await api.graphql.query(
      `query {
        users {
          id
          teams {
            members {
              user {
                id
              }
            }
          }
        }
      }`,
      {},
      token,
    )

    expect(body.data.users[0].teams[0].members[0].user.id).toEqual(user.id)
  })

  it('creates a team with members or without', async () => {
    const fragment = await new Fragment({ fragmentType: 'post' }).save()

    const noMembers = []
    const yesMembers = [
      {
        user: { id: user.id },
        alias: { email: 'unk@example.com' },
        status: 'invited',
      },
    ]

    const promises = [noMembers, yesMembers].map(async members => {
      const { body } = await api.graphql.query(
        `mutation($input: TeamInput) {
          createTeam(input: $input) {
            name
            members {
              user {
                id
              }
              alias {
                email
              }
              status
            }
            object {
              objectId
              objectType
            }
          }
        }`,
        {
          input: {
            name: 'My team',
            role: 'test',
            members,
            objectId: fragment.id,
            objectType: 'fragment',
          },
        },
        token,
      )

      expect(body).toEqual({
        data: {
          createTeam: {
            name: 'My team',
            members,
            object: {
              objectId: fragment.id,
              objectType: 'fragment',
            },
          },
        },
      })
    })
    await Promise.all(promises)
  })

  it('can query a team saved directly', async () => {
    const team = await new Team({
      name: 'NoMembers',
      role: 'test',
      members: [],
    }).save()

    const { body } = await api.graphql.query(
      `query($id: ID) {
        team(id: $id) {
          name
          members {
            user {
              id
            }
          }
        }
      }`,
      { id: team.id },
      token,
    )

    expect(body.data.team).toEqual({
      name: 'NoMembers',
      members: [],
    })
  })

  it('can update a team and its members', async () => {
    const team = await new Team({ name: 'Before', role: 'test' }).save()
    const { body } = await api.graphql.query(
      `mutation($id: ID, $input: TeamInput) {
          updateTeam(id: $id, input: $input) {
            name
            members {
              user {
                id
              }
            }
          }
        }`,
      {
        id: team.id,
        input: {
          name: 'After',
          members: [{ user: { id: user.id } }],
        },
      },
      token,
    )

    expect(body).toEqual({
      data: {
        updateTeam: {
          name: 'After',
          members: [{ user: { id: user.id } }],
        },
      },
    })
  })

  it('can update a team and also remove members', async () => {
    const otherUser = await new User(fixtures.otherUser).save()
    const team = await Team.query().upsertGraphAndFetch(
      {
        role: 'test',
        name: 'Test',
        members: [{ user: { id: user.id } }, { user: { id: otherUser.id } }],
      },
      { relate: true, unrelate: true },
    )

    const { body } = await api.graphql.query(
      `mutation($id: ID, $input: TeamInput) {
          updateTeam(id: $id, input: $input) {
            name
            members {
              id
              user {
                id
              }
            }
          }
        }`,
      {
        id: team.id,
        input: {
          name: 'After',
          members: [{ id: team.members[0].id }],
        },
      },
      token,
    )

    expect(body).toEqual({
      data: {
        updateTeam: {
          name: 'After',
          members: [
            { id: team.members[0].id, user: { id: team.members[0].user.id } },
          ],
        },
      },
    })

    // The team should no longer user as a member
    const updatedTeam = await Team.query()
      .findById(team.id)
      .eager('members')
    expect(updatedTeam.members).toHaveLength(1)

    // But the user should not be deleted
    expect(await User.query()).toHaveLength(2)
  })

  it('finds a team', async () => {
    const team = await new Team({ role: 'test', name: 'Test' }).save()

    const { body } = await api.graphql.query(
      `query($id: ID) {
        team(id: $id) {
          name
        }
      }`,
      { id: team.id },
      token,
    )
    expect(body.data.team.name).toEqual('Test')
  })

  it('finds a team by role', async () => {
    await new Team({ role: 'test1', name: 'Test1' }).save()
    await new Team({ role: 'test', name: 'Test' }).save()

    const body = await whereQuery({
      role: 'test',
    })

    expect(body.data.teams).toHaveLength(1)
    expect(body.data.teams[0].name).toEqual('Test')
  })

  it('find a team by role and object', async () => {
    const fragment = await new Fragment({ fragmentType: 'post' }).save()

    await Team.query().upsertGraph(
      {
        role: 'test',
        name: 'Test',
        objectId: fragment.id,
        objectType: 'fragment',
        members: [{ id: user.id }],
      },
      { relate: true, unrelate: true },
    )

    const body = await whereQuery({
      role: 'test',
      objectId: fragment.id,
      objectType: 'fragment',
    })

    expect(body.data.teams).toHaveLength(1)
  })

  describe('find a team by role, object, and member', () => {
    let fragment
    let user2

    beforeEach(async () => {
      fragment = await new Fragment({ fragmentType: 'post' }).save()
      user2 = await new User({
        email: 'hi@example.com',
        username: 'test2',
      }).save()

      await Team.query().upsertGraph(
        {
          role: 'test',
          name: 'Test',
          objectId: fragment.id,
          objectType: 'fragment',
          members: [
            {
              user: { id: user.id },
              alias: {
                email: 'alias@example.com',
              },
            },
            {
              user: { id: user2.id },
            },
          ],
        },
        { relate: true, unrelate: true },
      )
    })

    it('finds a team for 1 user (through members)', async () => {
      const body = await whereQuery({
        role: 'test',
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id],
      })

      expect(body.data.teams).toHaveLength(1)
      expect(body.data.teams[0].object).toEqual({
        objectId: fragment.id,
        objectType: 'fragment',
      })
      expect(body.data.teams[0].members).toHaveLength(2)
    })

    it('finds a team by alias of a member', async () => {
      const body = await whereQuery({
        role: 'test',
        objectId: fragment.id,
        objectType: 'fragment',
        alias: { email: 'alias@example.com' },
      })
      expect(body.data.teams).toHaveLength(1)
    })

    it('finds a team for both members', async () => {
      const body = await whereQuery({
        role: 'test',
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id, user2.id],
      })

      expect(body.data.teams).toHaveLength(1)
    })

    it('does not find a team for non-existent member', async () => {
      const body = await whereQuery({
        role: 'test',
        objectId: fragment.id,
        objectType: 'fragment',
        users: ['54513de6-b473-4b39-8f95-bcbb3ae58a2a'],
      })

      expect(body.data.teams).toHaveLength(0)
    })

    it('does not find a team if one of the members is wrong', async () => {
      const body = await whereQuery({
        role: 'test',
        objectId: fragment.id,
        objectType: 'fragment',
        users: [user.id, user2.id, '54513de6-b473-4b39-8f95-bcbb3ae58a2a'],
      })

      expect(body.data.teams).toHaveLength(0)
    })
  })
})
