const { logger, useTransaction } = require('@coko/server')

const { seedNotifications } = require('../../../scripts/seedNotifications')

const Group = require('../../group/group.model')
const Config = require('../../config/config.model')

exports.up = knex =>
  knex.schema.createTable('notifications', table => {
    table.uuid('id').primary()
    table.uuid('groupId').notNullable()
    table.uuid('emailTemplateId').nullable()
    table.string('notificationType').notNullable()
    table.string('event').notNullable()
    table.string('recipient').notNullable()
    table.string('subject').nullable()
    table.jsonb('ccEmails').notNullable()
    table.string('displayName').notNullable()
    table.boolean('active').notNullable().defaultTo(false)
    table.boolean('isDefault').notNullable().defaultTo(false)
    table.integer('delay').notNullable().defaultTo(0)
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true }).nullable()
    table.foreign('groupId').references('id').inTable('groups')
    table
      .foreign('emailTemplateId')
      .references('id')
      .inTable('email_templates')
      .onDelete('SET NULL')

    return useTransaction(async trx => {
      try {
        const groups = await Group.query(trx)
        logger.info(`Seeding notification events for ${groups.length} groups`)

        await Promise.all(
          groups.map(async group => {
            const config = await Config.query(trx).findOne({
              groupId: group.id,
            })

            if (!config) throw new Error('No config found for group')
            await seedNotifications(trx, group.id, config)
          }),
        )

        logger.info('Seeding notification events completed')
      } catch (error) {
        logger.error('Error seeding notification events:', error)
        throw error
      }
    })
  })

exports.down = knex => knex.schema.dropTable('notifications')
