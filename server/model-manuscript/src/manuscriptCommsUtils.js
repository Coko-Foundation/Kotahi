const models = require('@pubsweet/models')

/** For a given versionId, find the first/original version of that manuscript and return its ID */
const getIdOfFirstVersionOfManuscript = async versionId =>
  (await models.Manuscript.query().select('parentId').findById(versionId))
    .parentId || versionId

/** For a given versionId, find the latest version of that manuscript and return its ID */
const getIdOfLatestVersionOfManuscript = async versionId => {
  const firstVersionId = await getIdOfFirstVersionOfManuscript(versionId)

  return (
    await models.Manuscript.query()
      .select('id')
      .where({ parentId: firstVersionId })
      .orWhere({ id: firstVersionId })
      .orderBy('created', 'desc')
      .limit(1)
  )[0].id
}

module.exports = {
  getIdOfFirstVersionOfManuscript,
  getIdOfLatestVersionOfManuscript,
}
