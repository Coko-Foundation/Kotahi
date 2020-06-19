process.env.NODE_CONFIG = `{"pubsweet":{
  "components":[
    "@pubsweet/model-user",
    "@pubsweet/model-team",
    "@pubsweet/model-fragment"
  ]
}}`

const Team = require('../src/team')
const { dbCleaner } = require('pubsweet-server/test')
const migrate = require('@pubsweet/db-manager/src/commands/migrate')

describe('Migration to simplify object storage', () => {
  it('successfully migrates from JSONB to separate columns', async () => {
    // Clean database and run up until the migration we're testing
    await dbCleaner({ to: '1548205275-move-members.js' })

    // Get a team with the previous members array structure
    let team = await new Team({
      name: 'Test',
      role: 'test',
    }).save()

    // Using id and type 'team' here just for testing
    await Team.raw('UPDATE teams SET object = ?::jsonb WHERE id = ?', [
      JSON.stringify({ objectId: team.id, objectType: 'team' }),
      team.id,
    ])

    // Do the migration
    await migrate({ to: '1548205276-simplify-object.js' })

    // Check that members have migrated to the relationship
    team = await Team.query().findById(team.id)

    expect(team.objectId).toEqual(team.id)
    expect(team.objectType).toEqual('team')
    expect(team.object).toBeUndefined()
  })
})
