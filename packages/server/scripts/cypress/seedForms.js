const seedForms = require('../seedForms')

const seedFormsCypress = async () => {
  // eslint-disable-next-line global-require
  const { Group, Config } = require('@pubsweet/models')

  // eslint-disable-next-line no-console
  console.log('Seeding forms...')
  const group = await Group.query().findOne({ name: 'kotahi' })

  const activeConfig = await Config.query().findOne({
    groupId: group.id,
    active: true,
  })

  await seedForms(group, activeConfig)
  return null
}

module.exports = seedFormsCypress
