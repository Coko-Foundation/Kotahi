const FormData = require('form-data')
const fsPromised = require('fs').promises
const fs = require('fs')
const xml2js = require('xml2js')
const axios = require('axios')
const path = require('path')
const config = require('config')
const { v4: uuid } = require('uuid')
const { upsertArtifact } = require('../publishingCommsUtils')
const { parseDate } = require('../../utils/dateUtils')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const {
  htmlToJats,
  getCrossrefCitationsFromList,
} = require('../../utils/jatsUtils')

const Config = require('../../config/src/config')

const DOI_PATH_PREFIX = 'https://doi.org/'
const ABSTRACT_PLACEHOLDER = '‖ABSTRACT‖'
const CITATIONS_PLACEHOLDER = '‖CITATIONS‖'

const builder = new xml2js.Builder()
const parser = new xml2js.Parser()

const requestToCrossref = async (xmlFiles, activeConfig) => {
  const publishPromises = xmlFiles.map(async file => {
    const formData = new FormData()
    formData.append('login_id', activeConfig.formData.publishing.crossref.login)
    formData.append(
      'login_passwd',
      activeConfig.formData.publishing.crossref.password,
    )
    formData.append('fname', fs.createReadStream(file))

    const crossrefURL =
      activeConfig.formData.publishing.crossref.useSandbox === false
        ? 'https://doi.crossref.org/servlet/deposit'
        : 'https://test.crossref.org/servlet/deposit'

    const res = await axios.post(crossrefURL, formData, {
      headers: formData.getHeaders(),
    })
    // eslint-disable-next-line
    console.log('Response from Crossref')
    // eslint-disable-next-line
    console.log(res.data)
  })

  await Promise.all(publishPromises)
}

/** Publish either article or reviews to Crossref, according to config */
const publishToCrossref = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!activeConfig.formData.publishing.crossref.doiPrefix)
    throw new Error(
      'Could not publish to Crossref, as no DOI prefix is configured.',
    )

  if (activeConfig.formData.publishing.crossref.publicationType === 'article')
    await publishArticleToCrossref(manuscript).catch(err => {
      throw err
    })
  // else if (activeConfig.formData.publishing.crossref.publicationType === 'peer review')
  else
    await publishReviewsToCrossref(manuscript).catch(err => {
      throw err
    })
}

/** Get UTC timestamp in form yyyyMMddhhmmss */
const getCurrentCrossrefTimestamp = date => {
  const pad = val => (val < 10 ? `0${val}` : val.toString())

  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1 // +1 because month is zero-based
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const second = date.getUTCSeconds()

  return `${year}${pad(month)}${pad(day)}${pad(hour)}${pad(minute)}${pad(
    second,
  )}`
}

/** Get the list of citations as a fragment of Crossref-flavoured XML.
 * Citations are read from HTML, from submission.references, with one citation expected per paragraph. */
const getCitations = manuscript => {
  const rawCitationBlock = manuscript.submission.references

  let citations = []

  if (typeof rawCitationBlock === 'string') {
    citations = getCrossrefCitationsFromList(rawCitationBlock)
  }

  if (!citations || !citations.length) return null

  return citations
    .map(
      (c, i) =>
        `<citation key="${i}"><unstructured_citation>${c}</unstructured_citation></citation>`,
    )
    .join('')
}

/** Used to get a review or submission field
 * checking decision.jsonData[fieldName] or manuscript.submission[fieldName] */
const getReviewOrSubmissionField = (manuscript, fieldName) => {
  const decision = manuscript.reviews.find(r => r.isDecision)
  const decisionField = decision ? decision.jsonData[fieldName] : null

  if (decision && decisionField) {
    return decisionField
  }

  if (manuscript.submission[fieldName]) {
    return manuscript.submission[fieldName]
  }

  return null
}

/** Get DOI in form 10.12345/<suffix>
 * If the configured prefix includes 'https://doi.org/' and/or a trailing slash, these are dealt with gracefully. */
const getDoi = (suffix, activeConfig) => {
  let prefix = activeConfig.formData.publishing.crossref.doiPrefix
  if (!prefix) throw new Error('No DOI prefix configured.')
  if (prefix.startsWith(DOI_PATH_PREFIX))
    prefix = prefix.replace(DOI_PATH_PREFIX, '')
  if (prefix.endsWith('/')) prefix = prefix.replace('/', '')
  if (!/^10\.\d{4,9}$/.test(prefix))
    throw new Error(
      `Unrecognised DOI prefix "${activeConfig.formData.publishing.crossref.doiPrefix}"`,
    )
  return `${prefix}/${suffix}`
}

const getContributor = (author, isAdditional) => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    person_name: {
      $: {
        contributor_role: 'author',
        sequence: isAdditional ? 'additional' : 'first',
      },
      given_name: author.firstName,
      surname: author.lastName,
    },
  }

  if (author.affiliation)
    contributor.person_name.affiliation = author.affiliation
  return contributor
}

/** Gets issueYear from submission.issueYear or failing that, from submission.volumeNumber.
 * Checks that the year looks sensible (in range 2000-2099)
 */
const getIssueYear = manuscript => {
  let yearString =
    manuscript.submission.issueYear || manuscript.submission.volumeNumber
  if (typeof yearString !== 'string')
    throw new Error('Could not determine issue year')
  yearString = yearString.trim()

  // Only works for years 2000-2099
  if (!/^20\d\d$/.test(yearString))
    throw new Error(
      `Issue year '${yearString}' does not appear to be a valid year.`,
    )
  return yearString
}

/** Returns true if a DOI is not already in use.
 * It will also return true if the Crossref server is faulty or down, so that form submission is not prevented.
 */
const doiIsAvailable = async checkDOI => {
  try {
    // Try to find object listed at DOI
    await axios.get(`https://api.crossref.org/works/${checkDOI}/agency`)
    // eslint-disable-next-line no-console
    console.log(
      `DOI '${checkDOI}' is already taken. Custom suffix is unavailable.`,
    )
    return false // DOI is already in use
  } catch (err) {
    if (err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Crossref
      // console.log(`DOI '${checkDOI}' is available.`)
      return true
    }
    // Unexpected HTTP response (5xx)
    // Assume that the DOI is available, otherwise server errors at crossref will prevent form submission in Kotahi

    return true
  }
}

/** Returns true if the DOI is registered with Crossref.
 * It will also return true if the Crossref server is faulty or down, so that form submission is not prevented.
 */
const doiExists = async checkDOI => {
  try {
    // Try to find object listed at DOI
    await axios.get(`https://api.crossref.org/works/${checkDOI}/agency`)
    return true
  } catch (err) {
    if (err && err.response && err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Crossref
      // console.log(`DOI '${checkDOI}' is available.`)
      return false
    }
    // Unexpected response (e.g. HTTP 5xx)
    // Assume that the DOI exists, otherwise server errors at crossref will prevent form submission in Kotahi

    return true
  }
}

const emailRegex =
  /^[\p{L}\p{N}!/+\-_]+(\.[\p{L}\p{N}!/+\-_]+)*@[\p{L}\p{N}!/+\-_]+(\.[\p{L}_-]+)+$/u

/** Send submission to register an article, with appropriate metadata */
const publishArticleToCrossref = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!manuscript.submission)
    throw new Error('Manuscript has no submission object')
  if (!manuscript.submission.$title)
    throw new Error('Manuscript has no submission.$title')
  if (!manuscript.submission.$abstract)
    throw new Error('Manuscript has no submission.$abstract')
  if (!manuscript.submission.$authors)
    throw new Error('Manuscript has no submission.$authors field')
  if (!Array.isArray(manuscript.submission.$authors))
    throw new Error('Manuscript.submission.$authors is not an array')
  if (
    !emailRegex.test(activeConfig.formData.publishing.crossref.depositorEmail)
  )
    throw new Error(
      `Depositor email address "${activeConfig.formData.publishing.crossref.depositorEmail}" is misconfigured`,
    )

  const issueYear = getIssueYear(manuscript)
  const publishDate = new Date()
  const journalDoi = getDoi(0, activeConfig)

  const doiSuffix =
    getReviewOrSubmissionField(manuscript, '$doiSuffix') || manuscript.id

  const doi = getDoi(doiSuffix, activeConfig)
  if (!(await doiIsAvailable(doi))) throw Error('Custom DOI is not available.')

  const publishedLocation = `${activeConfig.formData.publishing.crossref.publishedArticleLocationPrefix}${manuscript.shortId}`
  const batchId = uuid()
  const citations = getCitations(manuscript)

  // Caution! Our json object must have properties in the correct order, and no undefined properties!

  const journal = {
    journal_metadata: {
      full_title: activeConfig.formData.publishing.crossref.journalName,
      abbrev_title:
        activeConfig.formData.publishing.crossref.journalAbbreviatedName,
      doi_data: {
        doi: journalDoi,
        resource: activeConfig.formData.publishing.crossref.journalHomepage,
      },
    },
    journal_issue: {
      publication_date: { year: issueYear },
    },
    journal_article: {
      titles: { title: manuscript.submission.$title },
      contributors: {
        // This seems really counterintuitive but it's how xml2js requires it
        person_name: manuscript.submission.$authors.map(
          (author, i) => getContributor(author, i).person_name,
        ),
      },
      abstract: {
        $: { xmlns: 'http://www.ncbi.nlm.nih.gov/JATS1' },
        _: ABSTRACT_PLACEHOLDER,
      },
      publication_date: {
        month: publishDate.getUTCMonth() + 1, // +1 because the month is zero-based
        day: publishDate.getUTCDate(),
        year: publishDate.getUTCFullYear(),
      },
      publisher_item: {
        item_number: {
          $: { item_number_type: 'institution' },
          _: manuscript.shortId,
        },
      },
    },
  }

  if (manuscript.submission.issueNumber) {
    if (manuscript.submission.volumeNumber)
      journal.journal_issue.journal_volume = {
        volume: manuscript.submission.volumeNumber,
      }
    journal.journal_issue.issue = manuscript.submission.issueNumber
  }

  if (activeConfig.formData.publishing.crossref.licenseUrl)
    journal.journal_article.program = {
      $: {
        name: 'AccessIndicators',
        xmlns: 'http://www.crossref.org/AccessIndicators.xsd',
      },
      license_ref: activeConfig.formData.publishing.crossref.licenseUrl,
    }

  journal.journal_article.doi_data = {
    doi,
    resource: publishedLocation,
  }

  if (citations) journal.journal_article.citation_list = CITATIONS_PLACEHOLDER

  const json = {
    doi_batch: {
      $: {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation':
          'http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schema/crossref4.4.2.xsd',
        xmlns: 'http://www.crossref.org/schema/4.4.2',
        version: '4.4.2',
        'xmlns:ai': 'http://www.crossref.org/AccessIndicators.xsd',
      },
      head: {
        doi_batch_id: batchId,
        timestamp: getCurrentCrossrefTimestamp(publishDate),
        depositor: {
          depositor_name:
            activeConfig.formData.publishing.crossref.depositorName,
          email_address:
            activeConfig.formData.publishing.crossref.depositorEmail,
        },
        registrant: activeConfig.formData.publishing.crossref.registrant,
      },
      body: {
        journal,
      },
    },
  }

  const xml = builder
    .buildObject(json)
    .replace(ABSTRACT_PLACEHOLDER, htmlToJats(manuscript.submission.$abstract))
    .replace(CITATIONS_PLACEHOLDER, citations)

  const dirName = `${+new Date()}-${manuscript.id}`
  await fsPromised.mkdir(dirName)
  const fileName = `submission-${batchId}.xml`
  await fsPromised.appendFile(`${dirName}/${fileName}`, xml)
  const filePath = `${dirName}/${fileName}`
  await requestToCrossref([filePath], activeConfig)
  await fs.rmdirSync(dirName, { recursive: true })
}

const publishReviewsToCrossref = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  if (!manuscript.submission.$doi)
    throw new Error('Field submission.$doi is not present')

  const template = await fsPromised.readFile(
    path.resolve(__dirname, 'crossref_publish_xml_template.xml'),
  )

  // Get array of numbers representing nonempty reviews, e.g. '1', '2' for review1, review2
  const notEmptyReviews = Object.entries(manuscript.submission)
    .filter(
      ([key, value]) =>
        key.length === 7 &&
        key.includes('review') &&
        !checkIsAbstractValueEmpty(value),
    )
    .map(([key]) => key.replace('review', ''))

  const jsonResult = await parser.parseStringPromise(template)

  const summaryDoiSuffix = manuscript.submission.summarycreator
    ? getReviewOrSubmissionField(manuscript, 'summarysuffix') ||
      `${manuscript.id}/`
    : null

  const summaryDoi = summaryDoiSuffix
    ? getDoi(summaryDoiSuffix, activeConfig)
    : null

  // only validate if a summary exists, i.e. there is a summary author/creator
  if (summaryDoi && !(await doiIsAvailable(summaryDoi)))
    throw Error(`Summary suffix is not available: ${summaryDoiSuffix}`)

  const xmls = (
    await Promise.all(
      notEmptyReviews.map(async reviewNumber => {
        if (!manuscript.submission[`review${reviewNumber}date`]) {
          return null
        }

        const doiSuffix =
          getReviewOrSubmissionField(
            manuscript,
            `review${reviewNumber}suffix`,
          ) || `${manuscript.id}/${reviewNumber}`

        const doi = getDoi(doiSuffix, activeConfig)
        if (!(await doiIsAvailable(doi)))
          throw Error(`Review suffix is not available: ${doiSuffix}`)

        const artifactId = await upsertArtifact({
          title: `Review: ${manuscript.submission.description}`,
          content: manuscript.submission[`review${reviewNumber}`],
          manuscriptId: manuscript.id,
          platform: 'Crossref',
          externalId: doi,
          hostedInKotahi: true,
          relatedDocumentUri: `https://doi.org/${manuscript.submission.$doi}`,
          relatedDocumentType: 'preprint',
        })

        const [year, month, day] = parseDate(
          manuscript.submission[`review${reviewNumber}date`],
        )

        const templateCopy = JSON.parse(JSON.stringify(jsonResult))
        templateCopy.doi_batch.body[0].peer_review[0].review_date[0].day[0] =
          day
        templateCopy.doi_batch.body[0].peer_review[0].review_date[0].month[0] =
          month
        templateCopy.doi_batch.body[0].peer_review[0].review_date[0].year[0] =
          year
        templateCopy.doi_batch.head[0].depositor[0].depositor_name[0] =
          activeConfig.formData.publishing.crossref.depositorName
        templateCopy.doi_batch.head[0].depositor[0].email_address[0] =
          activeConfig.formData.publishing.crossref.depositorEmail
        templateCopy.doi_batch.head[0].registrant[0] =
          activeConfig.formData.publishing.crossref.registrant
        templateCopy.doi_batch.head[0].timestamp[0] = +new Date()
        templateCopy.doi_batch.head[0].doi_batch_id[0] = String(
          +new Date(),
        ).slice(0, 8)

        if (manuscript.submission[`review${reviewNumber}creator`]) {
          const surname =
            manuscript.submission[`review${reviewNumber}creator`].split(' ')[1]

          templateCopy.doi_batch.body[0].peer_review[0].contributors[0].person_name[0] =
            {
              $: {
                contributor_role: 'reviewer',
                sequence: 'first',
              },
              given_name: [
                manuscript.submission[`review${reviewNumber}creator`].split(
                  ' ',
                )[0],
              ],
              surname: [surname || ''],
            }
        }

        templateCopy.doi_batch.body[0].peer_review[0] = {
          ...templateCopy.doi_batch.body[0].peer_review[0],
          $: {
            type: 'referee-report',
            stage: 'pre-publication',
            'revision-round': '0',
          },
        }

        templateCopy.doi_batch.body[0].peer_review[0].titles[0].title[0] = `Review: ${manuscript.submission.description}`
        templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] = doi
        templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${config['pubsweet-client'].baseUrl}/versions/${manuscript.id}/artifacts/${artifactId}`
        templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[0] =
          {
            inter_work_relation: [
              {
                _: manuscript.submission.$doi,
                $: {
                  'relationship-type': 'isReviewOf',
                  'identifier-type': 'doi',
                },
              },
            ],
          }

        if (summaryDoi) {
          templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[1] =
            {
              inter_work_relation: [
                {
                  _: summaryDoi,
                  $: {
                    'relationship-type': 'isSupplementTo',
                    'identifier-type': 'doi',
                  },
                },
              ],
            }
        }

        return { reviewNumber, xml: builder.buildObject(templateCopy) }
      }),
    )
  ).filter(Boolean)

  if (manuscript.submission.summary && manuscript.submission.summarydate) {
    const artifactId = await upsertArtifact({
      title: `Summary of: ${manuscript.submission.description}`,
      content: manuscript.submission.summary,
      manuscriptId: manuscript.id,
      platform: 'Crossref',
      externalId: summaryDoi,
      hostedInKotahi: true,
      relatedDocumentUri: `https://doi.org/${manuscript.submission.$doi}`,
      relatedDocumentType: 'preprint',
    })

    const templateCopy = JSON.parse(JSON.stringify(jsonResult))
    const [year, month, day] = parseDate(manuscript.submission.summarydate)
    templateCopy.doi_batch.body[0].peer_review[0].review_date[0].day[0] = day
    templateCopy.doi_batch.body[0].peer_review[0].review_date[0].month[0] =
      month
    templateCopy.doi_batch.body[0].peer_review[0].review_date[0].year[0] = year
    templateCopy.doi_batch.head[0].depositor[0].depositor_name[0] =
      'eLife Kotahi'
    templateCopy.doi_batch.head[0].depositor[0].email_address[0] =
      'elife-kotahi@kotahi.cloud'
    templateCopy.doi_batch.head[0].registrant[0] = 'eLife'
    templateCopy.doi_batch.head[0].timestamp[0] = +new Date()
    templateCopy.doi_batch.head[0].doi_batch_id[0] = String(+new Date()).slice(
      0,
      8,
    )

    if (manuscript.submission.summarycreator) {
      const surname = manuscript.submission.summarycreator.split(' ')[1]
      templateCopy.doi_batch.body[0].peer_review[0].contributors[0].person_name[0] =
        {
          $: {
            contributor_role: 'reviewer',
            sequence: 'first',
          },
          given_name: [manuscript.submission.summarycreator.split(' ')[0]],
          surname: [surname || ''],
        }
    }

    templateCopy.doi_batch.body[0].peer_review[0] = {
      ...templateCopy.doi_batch.body[0].peer_review[0],
      $: {
        type: 'aggregate',
        stage: 'pre-publication',
        'revision-round': '0',
      },
    }
    templateCopy.doi_batch.body[0].peer_review[0].titles[0].title[0] = `Summary of: ${manuscript.submission.description}`

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] =
      summaryDoi

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${config['pubsweet-client'].baseUrl}/versions/${manuscript.id}/artifacts/${artifactId}`
    templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[0] = {
      inter_work_relation: [
        {
          _: manuscript.submission.$doi,
          $: {
            'relationship-type': 'isReviewOf',
            'identifier-type': 'doi',
          },
        },
      ],
    }

    xmls.push({ summary: true, xml: builder.buildObject(templateCopy) })
  }

  const dirName = `${+new Date()}-${manuscript.id}`
  await fsPromised.mkdir(dirName)

  const fileCreationPromises = xmls.map(async xml => {
    const fileName = xml.reviewNumber
      ? `review${xml.reviewNumber}.xml`
      : 'summary.xml'

    await fsPromised.appendFile(`${dirName}/${fileName}`, xml.xml)
    return `${dirName}/${fileName}`
  })

  const xmlFiles = await Promise.all(fileCreationPromises)
  await requestToCrossref(xmlFiles, activeConfig)
  fs.rmdirSync(dirName, {
    recursive: true,
  })

  // eslint-disable-next-line no-console
  console.log(`Published ${xmlFiles.length} evaluation artifacts to Crossref`)
}

module.exports = {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
}
