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
const migrate = require('@pubsweet/db-manager/src/commands/migrate')

describe('Members migration', () => {
  it('has successfuly migrated members from array to relationship', async () => {
    // Clean database and run up until the migration we're testing
    await dbCleaner({ to: '1547596236-initial-team-member-migration.js' })

    const member1 = await new User({
      email: 'some1@example.com',
      username: 'member1',
    }).save()

    const member2 = await new User({
      email: 'some2@example.com',
      username: 'member2',
    }).save()

    // Get a team with the previous members array structure
    let team = await new Team({
      name: 'Test',
      role: 'globalSeniorEditor',
    }).save()

    await Team.raw('UPDATE teams SET members = ?::jsonb WHERE id = ?', [
      JSON.stringify([member1.id, member2.id]),
      team.id,
    ])

    // Do the migration
    await migrate({ to: '1548205275-move-members.js' })

    // Check that members have migrated to the relationship
    team = await Team.query()
      .findById(team.id)
      .eager('members')

    expect(team.members).toHaveLength(2)
  })
})
