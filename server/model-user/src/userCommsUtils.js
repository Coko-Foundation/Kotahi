const models = require('@pubsweet/models')
const Team = require('../../model-team/src/team')

const getUsersById = async userIds => models.User.query().findByIds(userIds)

/** Returns an object of boolean values corresponding to roles the user could hold:
 * admin, author, reviewer, editor, handlingEditor, seniorEditor, managingEditor.
 * Each is true if the user holds that role.
 * Also, "anyEditor" indicates if the user holds any editorial role for the manuscript,
 * and "editorOrAdmin" indicates if the user is anyEditor or admin. */
const getUserRolesInManuscript = async (userId, manuscriptId) => {
  const result = {
    admin: !!(await models.User.query().findById(userId)).admin,
    author: false,
    reviewer: false,
    editor: false,
    handlingEditor: false,
    seniorEditor: false,
    managingEditor: false,
  }

  const teams = await Team.query()
    .select('role')
    .where({ objectId: manuscriptId })
    .withGraphFetched('members')

  teams.forEach(t => {
    result[t.role] = true
  })

  result.anyEditor =
    result.editor ||
    result.handlingEditor ||
    result.seniorEditor ||
    result.managingEditor

  result.editorOrAdmin = result.anyEditor || result.admin

  return result
}

module.exports = { getUsersById, getUserRolesInManuscript }
