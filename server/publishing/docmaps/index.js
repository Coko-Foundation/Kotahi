const Handlebars = require('handlebars')
const { transform, isObject, isArray } = require('lodash')
const config = require('config')
const fnv = require('fnv-plus')
const models = require('@pubsweet/models')
const { publishSpecificAnnotationToHypothesis } = require('../hypothesis')

const {
  getFieldsMapForTemplating,
} = require('../../model-manuscript/src/manuscriptUtils')

const { getActiveForms } = require('../../model-form/src/formCommsUtils')

let allDocmapsScheme

try {
  // eslint-disable-next-line global-require, import/no-unresolved
  allDocmapsScheme = require('../../../config/journal/docmaps_scheme.json')
} catch (err) {
  allDocmapsScheme = null
}

const expandTemplate = availableFields => objVal =>
  Handlebars.compile(objVal)(availableFields)

const expandTemplatesOnSingleItemRecursive = (
  item,
  expandTemplateFunc,
  maxDepth,
) => {
  if (maxDepth < 0)
    throw new Error('Recursion error: possible cycle in docmapsScheme')
  if (isObject(item))
    return expandTemplatesAndRemoveDirectivesRecursive(
      item,
      expandTemplateFunc,
      maxDepth - 1,
    )
  if (isArray(item))
    return item.map(subItem =>
      expandTemplatesOnSingleItemRecursive(
        subItem,
        expandTemplateFunc,
        maxDepth - 1,
      ),
    )
  if (typeof item === 'string') return expandTemplateFunc(item)
  return item
}

/* eslint-disable no-param-reassign */
const expandTemplatesAndRemoveDirectivesRecursive = (
  scheme,
  expandTemplateFunc,
  maxDepth = 50,
) =>
  transform(scheme, (result, val, key) => {
    if (typeof key === 'string' && key.startsWith('__')) return // properties prefixed with __ are special directives not to be copied into the resulting docmap
    result[key] = expandTemplatesOnSingleItemRecursive(
      val,
      expandTemplateFunc,
      maxDepth,
    )
  })
/* eslint-enable no-param-reassign */

const tryPublishDocMaps = async manuscript => {
  if (!allDocmapsScheme) return false
  const group = await models.Group.query().findById(manuscript.groupId)

  // Checks if docmapsScheme has been configured for that group
  const docmapsSchemeExists = allDocmapsScheme.find(
    d => d.groupName === group.name,
  )

  if (!docmapsSchemeExists) return false

  const { docmapsScheme } = docmapsSchemeExists

  const activeConfig = await models.Config.query().findOne({
    groupId: group.id,
    active: true,
  })

  const { submissionForm, reviewForm, decisionForm } = await getActiveForms(
    group.id,
  )

  const fields = getFieldsMapForTemplating(
    manuscript,
    submissionForm,
    reviewForm,
    decisionForm,
  )

  const { doi, uri, title: manuscriptTitle } = fields
  const id = fnv.hash(`${config['pubsweet-server'].baseUrl}::${uri}`).hex()

  const fragment = expandTemplatesAndRemoveDirectivesRecursive(
    docmapsScheme,
    expandTemplate(fields),
  )

  await Promise.all(
    docmapsScheme.map(async (action, fIndex) => {
      const fragmentAction = fragment[fIndex]

      await Promise.all(
        action.outputs.map(async (output, oIndex) => {
          const fragmentOutput = fragmentAction.outputs[oIndex]
          const { __contentVenues, __content, __tag } = output

          const content = Handlebars.compile(__content)(fields)

          fragmentOutput.content = []

          if (__contentVenues.includes('hypothesis')) {
            const {
              artifactId,
              externalId: hypothesisId,
            } = await publishSpecificAnnotationToHypothesis(
              content,
              __content,
              __tag,
              uri,
              manuscriptTitle,
              manuscript.id,
              group.id,
            )

            // eslint-disable-next-line no-console
            console.log(
              `Docmaps: Published Hypothesis annotation ${hypothesisId} with content "${__content}", tagged "${__tag}", for ${uri}`,
            )

            fragmentOutput.content.push({
              type: 'web-page',
              url: `https://hypothes.is/a/${hypothesisId}`,
            })

            fragmentOutput.content.push({
              type: 'web-page',
              url: `${config['pubsweet-client'].baseUrl}/${group.name}/versions/${manuscript.id}/artifacts/${artifactId}`,
            })
          }

          if (__contentVenues.length)
            fragmentOutput.published = new Date().toISOString()
        }),
      )
    }),
  )

  const docmap = {
    '@context': 'https://w3id.org/docmaps/context.jsonld',
    id,
    type: 'docmap',
    publisher: {
      id: activeConfig.formData.publishing.crossref.journalHomepage,
      name: activeConfig.formData.publishing.crossref.journalName,
      homepage: activeConfig.formData.publishing.crossref.journalHomepage,
    },
    'first-step': '_:b0',
    steps: {
      '_:b0': {
        assertions: [],
        inputs: [
          {
            doi,
            url:
              manuscript.submission.link ||
              manuscript.submission.biorxivURL ||
              manuscript.submission.url ||
              manuscript.submission.uri,
          },
        ],
        actions: fragment,
      },
    },
  }

  const content = JSON.stringify(docmap)

  const existingDocmap = await models.Docmap.query().findOne({
    externalId: uri,
    groupId: group.id,
  })

  if (existingDocmap)
    await models.Docmap.query()
      .update({ content, manuscriptId: manuscript.id })
      .where({ externalId: uri, groupId: group.id })
  else
    await models.Docmap.query().insert({
      externalId: uri,
      content,
      manuscriptId: manuscript.id,
      groupId: group.id,
    })

  // eslint-disable-next-line no-console
  console.log(`Created docmap for ${uri}`)

  return docmap
}

module.exports = { tryPublishDocMaps }
