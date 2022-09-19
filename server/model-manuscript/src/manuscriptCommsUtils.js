const models = require('@pubsweet/models')
const { pubsubManager } = require('@coko/server')
const { raw } = require('objection')
const importArticlesFromBiorxiv = require('../../import-articles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../import-articles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../import-articles/pubmed-import')

const { getPubsub } = pubsubManager

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

let isImportInProgress = false

const importManuscripts = (_, props, ctx) => {
  if (isImportInProgress) return false
  isImportInProgress = true

  const promises = []

  if (process.env.INSTANCE_NAME === 'ncrc') {
    promises.push(importArticlesFromBiorxiv(ctx))
    promises.push(importArticlesFromPubmed(ctx))
  } else if (process.env.INSTANCE_NAME === 'colab') {
    promises.push(
      importArticlesFromBiorxivWithFullTextSearch(ctx, [
        'transporter*',
        'pump*',
        'gpcr',
        'gating',
        '*-gated',
        '*-selective',
        '*-pumping',
        'protein translocation',
      ]),
    )
  }

  if (!promises.length) return false

  Promise.all(promises)
    .catch(error => console.error(error))
    .finally(async () => {
      isImportInProgress = false
      const pubsub = await getPubsub()
      pubsub.publish('IMPORT_MANUSCRIPTS_STATUS', {
        manuscriptsImportStatus: true,
      })
    })

  return true
}

const manuscriptsUserHasCurrentRoleIn = async (_, input, ctx) => {
  // Get IDs of the top-level manuscripts
  const topLevelManuscripts = await models.Manuscript.query()
    .distinct(
      raw('coalesce(manuscripts.parent_id, manuscripts.id) AS top_level_id'),
    )
    .join('teams', 'manuscripts.id', '=', 'teams.object_id')
    .join('team_members', 'teams.id', '=', 'team_members.team_id')
    .where('team_members.user_id', ctx.user)
    .where('manuscripts.is_hidden', '=', false)

  // Get those top-level manuscripts with all versions, all with teams and members
  const manuscripts = await models.Manuscript.query()
    .withGraphFetched(
      '[teams.[members], manuscriptVersions(orderByCreated).[teams.[members]]]',
    )
    .whereIn(
      'id',
      topLevelManuscripts.map(m => m.topLevelId),
    )
    .orderBy('created', 'desc')

  const filteredManuscripts = []

  manuscripts.forEach(m => {
    const latestVersion =
      m.manuscriptVersions && m.manuscriptVersions.length > 0
        ? m.manuscriptVersions[m.manuscriptVersions.length - 1]
        : m

    if (
      latestVersion.teams.some(t =>
        t.members.some(member => member.userId === ctx.user),
      )
    )
      filteredManuscripts.push(m)
  })

  // eslint-disable-next-line no-undef
  return Promise.all(filteredManuscripts.map(m => repackageForGraphql(m)))
}

// Defining the condition for the archival of manuscript
const archiveOldMnauscripts = ctx => {
  // eslint-disable-next-line no-constant-condition
  if ('label' === 'submitted' || 'Ready to Evaluate') {
    return manuscriptsUserHasCurrentRoleIn
  }

  return null
}

module.exports = {
  getIdOfFirstVersionOfManuscript,
  getIdOfLatestVersionOfManuscript,
  importManuscripts,
  manuscriptsUserHasCurrentRoleIn,
  archiveOldMnauscripts,
}
