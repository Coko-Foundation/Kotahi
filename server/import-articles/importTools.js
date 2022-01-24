const ArticleImportSources = require('../model-article-import-sources/src/articleImportSources')
const ArticleImportHistory = require('../model-article-import-history/src/articleImportHistory')
const Form = require('../model-form/src/form')

const getServerId = async serverLabel => {
  let [server] = await ArticleImportSources.query().where({
    server: serverLabel,
  })

  if (server) return server.id
  await ArticleImportSources.query().insert({ server: serverLabel })
  ;[server] = await ArticleImportSources.query().where({
    server: serverLabel,
  })
  return server.id
}

/** Return the last import date for this server, or if no imports have been done, return start of epoch */
const getLastImportDate = async serverId => {
  const results = await ArticleImportHistory.query()
    .select('date')
    .where({ sourceId: serverId })

  if (results.length) return results[0].date
  return 0
}

const getEmptySubmission = async () => {
  const submissionForm = await Form.findOneByField('purpose', 'submit')

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

module.exports = {
  getServerId,
  getLastImportDate,
  getEmptySubmission,
  getDate2WeeksAgo,
}
