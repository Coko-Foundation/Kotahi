const models = require('@pubsweet/models')
const { getSubmissionForm } = require('../model-review/src/reviewCommsUtils')
const { importWorkersByGroup } = require('./imports')
const { DoiExistenceChecker } = require('./doiExistenceChecker')

const assertArgTypes = (args, ...typeSpecs) => {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    const typeSpec = typeSpecs[i]
    const types = Array.isArray(typeSpec) ? typeSpec : [typeSpec]

    if (!types.includes(typeof arg))
      throw new Error(
        `Illegal type of ${typeof arg} for param '${i}. Should be ${types.join(
          ' or ',
        )}.`,
      )
  }
}

const getEmptySubmission = async groupId => {
  const submissionForm = await getSubmissionForm(groupId)
  if (!submissionForm) throw new Error('No submission form was found!')

  const fields = submissionForm.structure.children.filter(field =>
    field.name.startsWith('submission.'),
  )

  const emptySubmission = fields.reduce((acc, curr) => {
    const [, nameInSubmission] = curr.name.split('submission.')
    acc[nameInSubmission] = [
      'CheckboxGroup',
      'LinksInput',
      'AuthorsInput',
    ].includes(curr.component)
      ? []
      : ''
    return {
      ...acc,
    }
  }, {})

  return emptySubmission
}

const getBroker = (groupId, workerName) => {
  let importWorkers = importWorkersByGroup[groupId]

  if (!importWorkers) {
    importWorkers = []
    importWorkersByGroup[groupId] = importWorkers
  }

  const doiChecker = new DoiExistenceChecker(groupId, false)
  const archivedDoiChecker = new DoiExistenceChecker(groupId, true)

  return {
    addManuscriptImporter: (importType, doImport) => {
      assertArgTypes([importType, doImport], 'string', 'function')
      importWorkers.push({
        name: workerName,
        importType,
        doImport,
      })
    },
    findManuscriptWithDoi: async doi =>
      doi
        ? models.Manuscript.query()
            .where({ groupId })
            // eslint-disable-next-line func-names
            .where(function () {
              this.whereRaw("submission->>'$doi' = ?", [doi]).orWhereRaw(
                "submission->>'doi' = ?",
                [doi],
              )
            })
            .first()
        : null,
    findManuscriptWithUri: async uri =>
      uri
        ? models.Manuscript.query()
            .where({ groupId })
            // eslint-disable-next-line func-names
            .where(function () {
              this.whereRaw("submission->>'$sourceUri' = ?", [uri]).orWhereRaw(
                "submission->>'link' = ?",
                [uri],
              )
            })
            .first()
        : null,
    getStubManuscriptObject: async () => ({
      status: 'new',
      isImported: false,
      submission: await getEmptySubmission(groupId),
      meta: { title: '' },
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
      reviews: [],
      teams: [],
    }),
    getSubmissionForm: () => getSubmissionForm(groupId),
    /** Return true if a manuscript with this DOI exists in the group.
     * Optionally, search among archived manuscripts as well as non-archived ones.
     * For efficiency, this caches all DOIs in memory, clearing the cache only after
     * 10 seconds have elapsed without hasManuscriptWithDoi() being called. */
    hasManuscriptWithDoi: async (doi, includeArchivedManuscripts = false) => {
      return (
        (await doiChecker.doiExists(doi)) ||
        (includeArchivedManuscripts && archivedDoiChecker.doiExists(doi))
      )
    },
    groupId,
    logger: console,
  }
}

module.exports = { getBroker }
