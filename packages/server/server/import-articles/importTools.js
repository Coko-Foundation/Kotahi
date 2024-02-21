const he = require('he')
const ArticleImportSources = require('../model-article-import-sources/src/articleImportSources')
const ArticleImportHistory = require('../model-article-import-history/src/articleImportHistory')
const { getSubmissionForm } = require('../model-review/src/reviewCommsUtils')

const getServerId = async (serverLabel, options = {}) => {
  const { trx } = options.trx

  let [server] = await ArticleImportSources.query(trx).where({
    server: serverLabel,
  })

  if (server) return server.id
  await ArticleImportSources.query(trx).insert({ server: serverLabel })
  ;[server] = await ArticleImportSources.query(trx).where({
    server: serverLabel,
  })
  return server.id
}

/** Return the last import date for this server, or if no imports have been done, return start of epoch */
const getLastImportDate = async (serverId, groupId, options = {}) => {
  const { trx } = options

  const results = await ArticleImportHistory.query(trx)
    .select('date')
    .where({ sourceId: serverId, groupId })

  if (results.length) return results[0].date
  return 0
}

const getEmptySubmission = async (groupId, options = {}) => {
  const { trx } = options

  const submissionForm = await getSubmissionForm(groupId, { trx })

  const parsedFormStructure = submissionForm.structure.children
    .map(formElement => {
      const parsedName = formElement.name && formElement.name.split('.')[1]

      if (parsedName) {
        return {
          name: parsedName,
          component: formElement.component,
        }
      }

      return undefined
    })
    .filter(x => x !== undefined)

  return parsedFormStructure.reduce((acc, curr) => {
    acc[curr.name] =
      curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
        ? []
        : ''
    return {
      ...acc,
    }
  }, {})
}

const getDate2WeeksAgo = () =>
  +new Date(new Date(Date.now()).toISOString().split('T')[0]) - 12096e5

/** Converts an abstract retrieved from bioRxiv or medRxiv to safe HTML. */
const rawAbstractToSafeHtml = raw => {
  if (!raw) return null
  // TODO replace substrings such as '{beta}', '{gamma}' with unicode characters. I don't know if they all use HTML entity names
  const encoded = he.encode(raw)
  return `<p>${encoded.replace(/\n\s*/g, '</p>\n<p>')}</p>`
}

module.exports = {
  getServerId,
  getLastImportDate,
  getEmptySubmission,
  getDate2WeeksAgo,
  rawAbstractToSafeHtml,
}
