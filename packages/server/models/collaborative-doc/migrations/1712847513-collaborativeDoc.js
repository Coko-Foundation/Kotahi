/* eslint-disable no-console */
const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.createTable('collaborative_docs', table => {
      table.uuid('id').primary()
      table.string('type')
      table.binary('y_doc_state').notNullable()
      table.uuid('group_id').references('groups.id').notNullable()
      table.uuid('object_id')
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
    })
  } catch (e) {
    logger.error('Doc: Initial: Migration failed!')
    throw new Error(e)
  }
}

exports.down = async knex => knex.schema.dropTable('docs')
