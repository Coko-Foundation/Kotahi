const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')
const { formatSearchQueryForPostgres } = require('../../utils/searchUtils')

const {
  getStartOfDay,
  getEndOfDay,
  compactStringToDate,
} = require('../../utils/dateUtils')

const SUBMISSION_FIELD_PREFIX = 'submission'
const META_FIELD_PREFIX = 'meta'

/** This returns a modified array of reviews, omitting fields or entire reviews marked as
 * hidden from author, UNLESS the current user is the reviewer the review belongs to.
 * This does not consider whether the user is an admin or editor of the manuscript:
 * that must be checked elsewhere.
 */
const stripConfidentialDataFromReviews = (
  reviews,
  reviewForm,
  decisionForm,
  userId,
) => {
  if (!reviewForm || !decisionForm) return []

  const confidentialReviewFields = reviewForm.structure.children
    .filter(field => field.hideFromAuthors === 'true')
    .map(field => field.name)

  const confidentialDecisionFields = decisionForm.structure.children
    .filter(field => field.hideFromAuthors === 'true')
    .map(field => field.name)

  return reviews
    .filter(r => !r.isHiddenFromAuthor || r.userId === userId)
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

const fixMissingValuesInFilesInSingleMsVersion = ms => {
  const result = { ...ms }

  if (ms.files)
    result.files = ms.files.map(f => ({
      ...f,
      tags: f.tags || [],
      storedObjects: f.storedObjects || [],
    }))

  return result
}

/** Returns a new manuscript object in which null/undefined files, file tags and file storedObjects are replaced with []. */
const fixMissingValuesInFiles = ms => {
  const result = fixMissingValuesInFilesInSingleMsVersion(ms)
  if (result.manuscriptVersions)
    result.manuscriptVersions = result.manuscriptVersions.map(v =>
      fixMissingValuesInFilesInSingleMsVersion(v),
    )

  return result
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
    .filter(f => f.field !== 'search')
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

      if (!/^[\w :./,()-<>=_]+$/.test(filter.value)) {
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
 * Returns [query, params]
 */
const buildQueryForManuscriptSearchFilterAndOrder = (
  sort,
  offset,
  limit,
  filters,
  submissionForm,
  timezoneOffsetMinutes,
) => {
  // These keep track of the various terms we're adding to SELECT, FROM, WHERE and ORDER BY, as well as params.)
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

  const searchFilter = filters.find(f => f.field === 'search')

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

module.exports = {
  buildQueryForManuscriptSearchFilterAndOrder,
  stripConfidentialDataFromReviews,
  fixMissingValuesInFiles,
  hasEvaluations,
}
