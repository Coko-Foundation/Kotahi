/* eslint-disable global-require, no-console, import/no-dynamic-require, no-await-in-loop, no-continue */
const models = require('@pubsweet/models')
const { chunk } = require('lodash')

const importWorkersByGroup = {}

const runImports = async (groupId, submitterId = null) => {
  const importType = submitterId ? 'manual' : 'automatic'
  const allNewManuscripts = []
  const urisAlreadyImporting = []
  const doisAlreadyImporting = []

  const importWorkers = importWorkersByGroup[groupId]

  for (let i = 0; i < importWorkers.length; i += 1) {
    const worker = importWorkers[i]
    if (![importType, 'any'].includes(worker.importType)) continue

    console.info(`Importing manuscripts using plugin ${worker.name}`)
    let importSource, lastImportDate

    try {
      let [sourceRecord] = await models.ArticleImportSources.query().where({
        server: worker.name,
      })
      if (!sourceRecord)
        sourceRecord = await models.ArticleImportSources.query().insertAndFetch(
          {
            server: worker.name,
          },
        )
      importSource = sourceRecord.id

      const lastImportRecord = await models.ArticleImportHistory.query()
        .select('date')
        .findOne({ sourceId: importSource, groupId })

      lastImportDate = lastImportRecord ? lastImportRecord.date : null
    } catch (error) {
      console.error(
        `Failed to query sourceId and lastImportDate for plugin ${worker.name} on group ${groupId}. Skipping.`,
      )
      console.error(error)
      continue
    }

    let newManuscripts

    try {
      newManuscripts = await worker.doImport({
        urisAlreadyImporting: [...urisAlreadyImporting],
        doisAlreadyImporting: [...doisAlreadyImporting],
        lastImportDate: lastImportDate ? new Date(lastImportDate) : null,
      })
    } catch (error) {
      console.error(
        `Import plugin ${worker.name} failed on group ${groupId}. Skipping.`,
      )
      console.error(error)
      continue
    }

    if (!Array.isArray(newManuscripts))
      throw new Error(
        `Expected ${worker.name} import function to return an array of manuscripts, but received ${newManuscripts}`,
      )
    console.info(
      `Found ${newManuscripts.length} new manuscripts for group ${groupId}.`,
    )

    newManuscripts.forEach(m => {
      // TODO check manuscript structure
      const uri =
        m.submission.link ||
        m.submission.biorxivURL ||
        m.submission.url ||
        m.submission.uri

      const { doi } = m

      // TODO replace an earlier manuscript if it shares uri or DOI

      // force some fields to be empty; provide defaults for others.
      allNewManuscripts.push({
        submission: {},
        meta: { title: '' },
        importSourceServer: null,
        ...m,
        status: 'new',
        isImported: true,
        importSource,
        submitterId,
        channels: [
          {
            topic: 'Manuscript discussion',
            type: 'all',
          },
          {
            topic: 'Editorial discussion',
            type: 'editorial',
          },
        ],
        files: [],
        reviews: [], // TODO This forces reviews to be empty. This should change if we want to import manuscripts with reviews already attached
        teams: [],
        groupId,
      })

      if (doi) doisAlreadyImporting.push(doi)
      if (uri) urisAlreadyImporting.push(uri)
    })

    if (lastImportDate) {
      await models.ArticleImportHistory.query()
        .patch({ date: new Date().toISOString() })
        .where({ sourceId: importSource, groupId })
    } else {
      await models.ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId: importSource,
        groupId,
      })
    }
  }

  try {
    const chunks = chunk(allNewManuscripts, 10)
    await Promise.all(
      chunks.map(async ch => {
        await models.Manuscript.query().upsertGraphAndFetch(ch, {
          relate: true,
        })
      }),
    )
  } catch (e) {
    console.error(e)
  }

  console.info(
    `Imported ${allNewManuscripts.length} manuscripts into group ${groupId} using plugins, with ${submitterId} as submitterId.`,
  )
}

module.exports = { runImports, importWorkersByGroup }
