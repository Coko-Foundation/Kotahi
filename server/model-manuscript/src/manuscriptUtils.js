// eslint-disable-next-line import/no-unresolved
const Handlebars = require('handlebars')
const { set, get } = require('lodash')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')
const { formatSearchQueryForPostgres } = require('../../utils/searchUtils')
const { getPublishableTextFromValue } = require('../../utils/fieldFormatUtils')

const {
  getStartOfDay,
  getEndOfDay,
  compactStringToDate,
} = require('../../utils/dateUtils')

const SUBMISSION_FIELD_PREFIX = 'submission'
const META_FIELD_PREFIX = 'meta'
const URI_SEARCH_PARAM = 'search'

/** This returns a modified array of reviews, omitting fields or entire reviews marked as
 * hidden from author, UNLESS the current user is the reviewer the review belongs to.
 * This does not consider whether the user is a groupManager/admin or editor of the manuscript:
 * that must be checked elsewhere.
 */
const stripConfidentialDataFromReviews = (
  reviews,
  reviewForm,
  decisionForm,
  sharedReviewersIds,
  userId,
  userRoles,
  manuscriptHasDecision,
) => {
  if (!reviewForm || !decisionForm) return []

  const confidentialReviewFields = reviewForm.structure.children
    .filter(field => field.hideFromAuthors === 'true')
    .map(field => field.name)

  const confidentialDecisionFields = decisionForm.structure.children
    .filter(
      field =>
        field.hideFromAuthors === 'true' &&
        userRoles.author &&
        field.component !== 'ThreadedDiscussion',
    )
    .map(field => field.name)

  return reviews
    .filter(
      r =>
        (!r.isHiddenFromAuthor && manuscriptHasDecision) ||
        // TODO the above case is not tightly enough controlled.
        // Even if the review is not 'hidden' and the manuscript has a decision,
        // we should also require that the review has been completed, and that
        // either the manuscript has been published or the current user is its
        // author.
        // The current logic is still safer and more secure than what we had
        // previously, which delivered reviews to the client with few controls.
        // Further improvements should probably go hand in hand with improving
        // what data we store in a Review object: it should really store status
        // and isShared, rather than requiring us to retrieve these from the
        // TeamMember object.
        (userRoles.author && r.isDecision) || // decision will have restricted data stripped
        r.userId === userId ||
        (sharedReviewersIds.includes(r.userId) && !r.isDecision),
    )
    .map(review => {
      const r = { ...review, jsonData: ensureJsonIsParsed(review.jsonData) }
      if (r.userId === userId) return r
      if (r.isHiddenReviewerName) r.userId = null

      const confidentialFields = r.isDecision
        ? confidentialDecisionFields
        : confidentialReviewFields

      const filteredJsonData = {}

      Object.entries(r.jsonData).forEach(([key, value]) => {
        if (!confidentialFields.includes(key)) filteredJsonData[key] = value
      })
      r.jsonData = filteredJsonData
      return r
    })
}

/** Get evaluations as
 * [
 *  [submission.review1, submission.review1date],
 *  [submission.review2, submission.review2date],
 *  ...,
 *  [submission.summary, submission.summarydate]
 * ]
 * These are evaluations in the submission form, NOT normal reviews. */
const getEvaluationsAndDates = manuscript => {
  const evaluationValues = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review'),
    )
    .map(([propName, value]) => [
      value,
      manuscript.submission[`${propName}date`],
    ])

  evaluationValues.push([
    manuscript.submission.summary,
    manuscript.submission.summarydate,
  ])

  return evaluationValues
}

const hasEvaluations = manuscript => {
  const evaluations = getEvaluationsAndDates(manuscript)
  return evaluations.map(checkIsAbstractValueEmpty).some(isEmpty => !isEmpty)
}

/** Checks if the field exists in the form and is validly named (not causing risk of sql injection),
 * and if so returns the groupName ('meta' or 'submission') and the field name.
 * Also returns valuesAreKeyedObjects, which indicates whether values for this field
 * are key-value pairs as opposed to strings.
 */
const getSafelyNamedJsonbFieldInfo = (fieldName, submissionForm) => {
  const groupName = [SUBMISSION_FIELD_PREFIX, META_FIELD_PREFIX].find(x =>
    fieldName.startsWith(`${x}.`),
  )

  if (!groupName) return null

  const field =
    submissionForm &&
    submissionForm.structure.children.find(f => f.name === fieldName)

  if (!field) {
    console.warn(`Ignoring unknown field "${fieldName}"`)
    return null
  }

  const name = fieldName.substring(groupName.length + 1)

  if (!/^[a-zA-Z]\w*$/.test(name)) {
    console.warn(`Ignoring unsupported field "${fieldName}"`)
    return null
  }

  return { groupName, name, valuesAreKeyedObjects: !!field.options }
}

/** Check that the field exists and is not dangerously named (to avoid sql injection) */
const isValidNonJsonbField = (fieldName, submissionForm) => {
  if (!/^[a-zA-Z]\w*$/.test(fieldName)) {
    console.warn(`Ignoring unsupported field "${fieldName}"`)
    return false
  }

  if (
    !submissionForm ||
    submissionForm.structure.children.find(f => f.name === fieldName)
  ) {
    console.warn(`Ignoring unknown field "${fieldName}"`)
    return false
  }

  return true
}

/** Filtering function to discard items with duplicate fields */
const discardDuplicateFields = (item, index, self) =>
  self.findIndex(x => x.field === item.field) === index

/** Add a query component, with parameters.
 * This is used for building up the components of SELECT, FROM, WHERE and ORDER BY clauses. */
const addItem = (collection, rawFragment, params) => {
  collection.rawFragments.push(rawFragment)
  collection.params.push(...params)
}

/** Apply a specified ordering to the query.
 * This doesn't apply search rank ordering, which is done elsewhere.
 */
const applySortOrder = ({ field, isAscending }, submissionForm, addOrder) => {
  const sortDirection = isAscending ? '' : ' DESC'
  const jsonbField = getSafelyNamedJsonbFieldInfo(field, submissionForm)

  if (jsonbField) {
    const { groupName: jsonGroup, name: jsonName } = jsonbField
    addOrder(`LOWER(${jsonGroup}->>?)${sortDirection}`, jsonName)
  } else if (isValidNonJsonbField(field, submissionForm)) {
    // eslint-disable-next-line no-param-reassign
    field = field === 'shortId' ? 'short_id' : field

    addOrder(`${field}${sortDirection}`)
  } else {
    console.warn(`Could not sort on field "${field}`)
  }

  addOrder(`short_id${sortDirection}`) // Secondary ordering
}

/** Apply all the specified filters to the query,
 * except for the special "search" filter which is dealt with separately. */
const applyFilters = (
  /** Array of {field, value} objects */
  filters,
  submissionForm,
  /** Function to add a WHERE clause to SQL query. Arguments are: (rawCondition, ...params). Each '?' in the rawCondition needs a corresponding param. */
  addWhere,
  /** The local timezone offset */
  timezoneOffsetMinutes,
) => {
  filters
    .filter(discardDuplicateFields)
    .filter(f => f.field !== URI_SEARCH_PARAM)
    .forEach(filter => {
      if (['created', 'updated'].includes(filter.field)) {
        try {
          const parts = filter.value.split('-')

          const dateFrom = getStartOfDay(
            compactStringToDate(parts[0], timezoneOffsetMinutes),
            timezoneOffsetMinutes,
          )

          const dateTo = getEndOfDay(
            compactStringToDate(parts[1], timezoneOffsetMinutes),
            timezoneOffsetMinutes,
          )

          addWhere(`${filter.field} >= ?`, dateFrom.toISOString())
          addWhere(`${filter.field} <= ?`, dateTo.toISOString())
        } catch (error) {
          console.warn(
            `Could not filter ${filter.field} by value '${filter.value}': could not parse as a date range.`,
          )
        }

        return
      }

      if (!/^[\w :./,()\-<>=_]+$/.test(filter.value)) {
        console.warn(
          `Ignoring filter "${filter.field}" with illegal value "${filter.value}"`, // To prevent code injection!
        )
        return // i.e., continue.
      }

      const jsonbField = getSafelyNamedJsonbFieldInfo(
        filter.field,
        submissionForm,
      )

      if (jsonbField) {
        const {
          groupName: jsonGroup,
          name: jsonName,
          valuesAreKeyedObjects: isKeyed,
        } = jsonbField

        if (isKeyed) {
          addWhere(`(${jsonGroup}->?)::jsonb \\? ?`, jsonName, filter.value)
        } else {
          addWhere(`${jsonGroup}->>? = ?`, jsonName, filter.value)
        }
      } else if (filter.field === 'status') {
        addWhere('status = ?', filter.value)
      } else {
        console.warn(
          `Could not filter on field "${filter.field}" by value "${filter.value}"`,
        )
      }
    })
}

/** Builds a raw query string and an array of params, based on the requested filtering, sorting, offset and limit.
 * If manuscriptIDs is specified, then the query is restricted to those IDs.
 * Returns [query, params]
 */
const buildQueryForManuscriptSearchFilterAndOrder = (
  sort,
  offset,
  limit,
  filters,
  submissionForm,
  timezoneOffsetMinutes,
  manuscriptIDs = null,
) => {
  // These keep track of the various terms we're adding to SELECT, FROM, WHERE and ORDER BY, as well as params.
  const selectItems = { rawFragments: [], params: [] }
  const fromItems = { rawFragments: [], params: [] }
  const whereItems = { rawFragments: [], params: [] }
  const orderItems = { rawFragments: [], params: [] }
  const addSelect = (frag, ...params) => addItem(selectItems, frag, params)
  const addFrom = (frag, ...params) => addItem(fromItems, frag, params)
  const addWhere = (frag, ...params) => addItem(whereItems, frag, params)
  const addOrder = (frag, ...params) => addItem(orderItems, frag, params)

  addSelect('id')
  addSelect('count(1) OVER() AS full_count') // Count of all results (not just this page)
  addFrom('manuscripts')
  addWhere('parent_id IS NULL')
  addWhere('is_hidden IS NOT TRUE')

  if (manuscriptIDs) {
    addWhere('id = ANY(?)', manuscriptIDs)
  }

  const searchFilter = filters.find(f => f.field === URI_SEARCH_PARAM)

  const searchQuery =
    searchFilter && formatSearchQueryForPostgres(searchFilter.value)

  if (searchQuery) {
    addSelect('ts_rank_cd(search_tsvector, query) AS rank')
    addSelect(
      `ts_headline('english', manuscripts.searchable_text, query) AS snippet`,
    )
    addFrom('to_tsquery(?) query', searchQuery)
    addWhere('search_tsvector @@ query')
    addOrder('rank DESC')
  }

  if (!searchQuery && sort) {
    applySortOrder(sort, submissionForm, addOrder)
  } else {
    // Give it some order to prevent it changing on refetch.
    addOrder('created DESC')
    addOrder('short_id DESC')
  }

  applyFilters(filters, submissionForm, addWhere, timezoneOffsetMinutes)

  const query = `
      SELECT ${selectItems.rawFragments.join(', ')}
      FROM ${fromItems.rawFragments.join(', ')}
      WHERE ${whereItems.rawFragments.join(' AND ')}
      ORDER BY ${orderItems.rawFragments.join(', ')}
      LIMIT ${limit}
      OFFSET ${offset};`

  const params = selectItems.params.concat(
    fromItems.params,
    whereItems.params,
    orderItems.params,
  )

  return [query, params]
}

/** Get the current version of a ThreadedDiscussion comment */
const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return ''

  return commentObject.commentVersions[commentObject.commentVersions.length - 1]
    .comment
}

/** For a given form and corresponding data object, generate entries in the fieldsMap for all fields.
 * fieldsMap will be given a nested structure of keys (field names) and values. If objectId is supplied,
 * that will be inserted at the top of the nested structure. objectId may be a uuid, or may simply be a
 * text name such as 'decision'.
 * Currently, some data is added to the map twice: once with a uuid at the top, and once with a simple string
 * (or nothing) at the top. This permits the resulting map to be used in different circumstances.
 */
const addAllFieldsToTemplatingMap = (
  fieldsMap,
  objectId,
  formData,
  form,
  threadedDiscussions,
) => {
  form.structure.children.forEach(field => {
    const value = get(formData, field.name)

    if (field.component === 'ThreadedDiscussion') {
      if (!threadedDiscussions) return
      const discussion = threadedDiscussions.find(td => td.id === value)
      if (!discussion) return

      discussion.threads.forEach(thread => {
        thread.comments.forEach(comment => {
          const text = getPublishableTextFromComment(comment)
          set(
            fieldsMap,
            `${objectId ? `${objectId}.` : ''}${field.name}:${comment.id}`,
            text,
          )
        })
      })
      return
    }

    const content = getPublishableTextFromValue(value, field)
    set(fieldsMap, `${objectId ? `${objectId}.` : ''}${field.name}`, content)
  })
}

/** There's no standard way to store DOIs, so we have to look in various places.
 * Note that the actual DOI does not include 'https://doi.org/'
 */
const getDoi = manuscript => {
  const doi =
    manuscript.doi ||
    manuscript.submission.DOI ||
    manuscript.submission.doi ||
    manuscript.submission.articleURL

  if (typeof doi !== 'string') return null
  if (doi.startsWith('https://doi.org/')) return doi.substring(16)
  return doi
}

/** There's no standard way to store preprint URIs, so we have to look in various places. */
const getPreprintUri = manuscript => {
  let uri =
    manuscript.submission.biorxivURL ||
    manuscript.submission.link ||
    manuscript.submission.url ||
    manuscript.submission.uri

  if (typeof uri !== 'string') return null
  // Hypothesis autoredirects the following URIs, which is a pain:
  if (uri.startsWith('https://biorxiv.org/'))
    uri = uri.replace('https://biorxiv.org/', 'https://www.biorxiv.org/')
  return uri
}

/** There's no single place to store manuscript title, so we check in various places */
const getTitle = manuscript =>
  manuscript.meta.title ||
  manuscript.submission.title ||
  manuscript.submission.description

/** Create a nested object with keys and values for all fields (and ThreadedDiscussion comments)
 * of the given manuscript, its reviews and decisions. This object is constructed as a lookup
 * for the Handlebar templating engine.
 */
const getFieldsMapForTemplating = (
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  // TODO Currently we have different code using two different styles:
  // '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.authors', and
  // 'submission.authors'.
  // We should simplify, so we only use the object IDs when referring to reviews
  // (since there may be multiple reviews).

  const fieldsMap = {
    shortId: manuscript.shortId,
    status: manuscript.status,
    meta: {
      title: manuscript.meta.title || '',
      abstract: manuscript.meta.abstract || '',
    },
    doi: getDoi(manuscript) || '',
    uri: getPreprintUri(manuscript) || '',
    title: getTitle(manuscript) || '',
  }

  // Duplicate these entries with keys containing id, e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.shortId'
  Object.entries(fieldsMap).forEach(([key, val]) => {
    fieldsMap[`${manuscript.id}.${key}`] = val
  })

  // Add all submission fields referenced as e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    manuscript.id,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all submission fields referenced as e.g. 'submission.authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    null,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all review and decision fields referenced as e.g. '913ed8c4-794e-470e-9214-9c77d90e0144.comment'
  manuscript.reviews.forEach(review =>
    addAllFieldsToTemplatingMap(
      fieldsMap,
      review.id,
      review,
      review.isDecision ? decisionForm : reviewForm,
      manuscript.threadedDiscussions,
    ),
  )
  // Add all decision fields referenced as e.g. 'decision.verdict'
  const decision = manuscript.reviews.find(r => r.isDecision)
  if (decision)
    addAllFieldsToTemplatingMap(
      fieldsMap,
      'decision',
      decision,
      decisionForm,
      manuscript.threadedDiscussions,
    )

  return fieldsMap
}

/** Expand all handlebars templates in the content of published artifacts */
const applyTemplatesToArtifacts = (
  artifacts,
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  const fieldsMap = artifacts.length
    ? getFieldsMapForTemplating(
        manuscript,
        submissionForm,
        reviewForm,
        decisionForm,
      )
    : null

  return artifacts.map(artifact => ({
    ...artifact,
    content: Handlebars.compile(artifact.content, { noEscape: true })(
      fieldsMap,
    ),
  }))
}

module.exports = {
  buildQueryForManuscriptSearchFilterAndOrder,
  stripConfidentialDataFromReviews,
  hasEvaluations,
  applyTemplatesToArtifacts,
  getFieldsMapForTemplating,
}
