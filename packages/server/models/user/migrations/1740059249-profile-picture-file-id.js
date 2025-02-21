const { useTransaction, File, fileStorage } = require('@coko/server')

const User = require('../user.model')

const PROFILE_PICTURE = 'profile_picture'
const USERS = 'users'
const FILES = 'files'
const ID = 'id'

exports.up = async db => {
  await useTransaction(async trx => {
    await User.query(trx)
      .patch({
        profilePicture: null,
      })
      .where({
        profilePicture: '/profiles/default_avatar.svg',
      })

    const usersWithPicture = await User.query(trx).whereNotNull(PROFILE_PICTURE)

    await Promise.all(
      usersWithPicture.map(async u => {
        const file = await File.findOne({ objectId: u.id }, { trx })

        await u.$query(trx).patch({
          profilePicture: file.id,
        })
      }),
    )
  })

  await db.schema.alterTable(USERS, table => {
    table.uuid(PROFILE_PICTURE).nullable().references(ID).inTable(FILES).alter()
  })
}

/**
 * Use pure knex so that rolling back works without needing to revert changes
 * in the User objection model.
 */
exports.down = async db => {
  try {
    await db.schema.alterTable(USERS, table => {
      table.dropForeign(PROFILE_PICTURE)
    })

    await db.schema.alterTable(USERS, table => {
      table.text(PROFILE_PICTURE).nullable().alter()
    })

    const usersWithPicture = await db(USERS).whereNotNull(PROFILE_PICTURE)

    await db.transaction(async trx => {
      await Promise.all(
        usersWithPicture.map(async u => {
          const file = await File.findById(u.profilePicture, { trx })
          const small = file.getStoredObjectBasedOnType('small')
          const url = await fileStorage.getURL(small.key)

          await trx(USERS).where({ id: u.id }).update({ profilePicture: url })
        }),
      )
    })
  } catch (e) {
    await db.schema.alterTable(USERS, table => {
      table
        .uuid(PROFILE_PICTURE)
        .nullable()
        .references(ID)
        .inTable(FILES)
        .alter()
    })

    throw e
  }
}
