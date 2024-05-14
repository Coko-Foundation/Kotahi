const seedForms = require('../seedForms')

const seedFormsCypress = async () => {
  /* eslint-disable global-require */
  const Group = require('../../models/group/group.model')
  const Config = require('../../models/config/config.model')
  /* eslint-enable global-require */

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
