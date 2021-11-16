const FormData = require('form-data')
const fsPromised = require('fs').promises
const fs = require('fs')
const xml2js = require('xml2js')
const axios = require('axios')
const path = require('path')
const config = require('config')
const { v4: uuid } = require('uuid')

const { parseDate } = require('../../utils/dateUtils')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const {
  htmlToJats,
  getCrossrefCitationsFromList,
} = require('../../utils/jatsUtils')

const DOI_PATH_PREFIX = 'https://doi.org/'
const ABSTRACT_PLACEHOLDER = '‖ABSTRACT‖'
const CITATIONS_PLACEHOLDER = '‖CITATIONS‖'

const builder = new xml2js.Builder()
const parser = new xml2js.Parser()

const requestToCrossref = async xmlFiles => {
  const publishPromises = xmlFiles.map(async file => {
    const formData = new FormData()
    formData.append('login_id', config.crossref.login)
    formData.append('login_passwd', config.crossref.password)
    formData.append('fname', fs.createReadStream(file))

    const crossrefURL =
      config.crossref.useSandbox === 'false'
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
  if (!config.crossref.doiPrefix)
    throw new Error(
      'Could not publish to Crossref, as no DOI prefix is configured.',
    )

  try {
    if (config.crossref.publicationType === 'article')
      await publishArticleToCrossref(manuscript)
    // else if (config.crossref.publicationType === 'reviews')
    else publishReviewsToCrossref(manuscript)
  } catch (err) {
    throw new Error(`Publishing to Crossref failed: ${err.message}`)
  }
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
 * Citations are read from HTML, from either submission.citations or submission.references, with one citation expected per paragraph. */
const getCitations = manuscript => {
  const rawCitationBlock =
    manuscript.submission.citations || manuscript.submission.references

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

/** Get DOI in form 10.12345/<suffix>
 * If the configured prefix includes 'https://doi.org/' and/or a trailing slash, these are dealt with gracefully. */
const getDoi = suffix => {
  let prefix = config.crossref.doiPrefix
  if (!prefix) throw new Error('No DOI prefix configured.')
  if (prefix.startsWith(DOI_PATH_PREFIX))
    prefix = prefix.replace(DOI_PATH_PREFIX, '')
  if (prefix.endsWith('/')) prefix = prefix.replace('/', '')
  if (!/^10\.\d{4,9}$/.test(prefix))
    throw new Error(`Unrecognised DOI prefix "${config.crossref.doiPrefix}"`)
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

const emailRegex = /^[\p{L}\p{N}!/+\-_]+(\.[\p{L}\p{N}!/+\-_]+)*@[\p{L}\p{N}!/+\-_]+(\.[\p{L}_-]+)+$/u

/** Send submission to register an article, with appropriate metadata */
const publishArticleToCrossref = async manuscript => {
  if (!manuscript.submission)
    throw new Error('Manuscript has no submission object')
  if (!manuscript.meta.title) throw new Error('Manuscript has no title')
  if (!manuscript.meta.abstract) throw new Error('Manuscript has no abstract')
  if (!manuscript.submission.authors)
    throw new Error('Manuscript has no submission.authors field')
  if (!Array.isArray(manuscript.submission.authors))
    throw new Error('Manuscript.submission.authors is not an array')
  if (!emailRegex.test(config.crossref.depositorEmail))
    throw new Error(
      `Depositor email address "${config.crossref.depositorEmail}" is misconfigured`,
    )

  const issueYear = getIssueYear(manuscript)
  const publishDate = new Date()
  const journalDoi = getDoi(0)
  const doi = getDoi(manuscript.id)
  const publishedLocation = `${config.crossref.publishedArticleLocationPrefix}${manuscript.shortId}`
  const batchId = uuid()
  const citations = getCitations(manuscript)

  // Caution! Our json object must have properties in the correct order, and no undefined properties!

  const journal = {
    journal_metadata: {
      full_title: config.crossref.journalName,
      abbrev_title: config.crossref.journalAbbreviatedName,
      doi_data: {
        doi: journalDoi,
        resource: config.crossref.journalHomepage,
      },
    },
    journal_issue: {
      publication_date: { year: issueYear },
    },
    journal_article: {
      titles: { title: manuscript.meta.title },
      contributors: {
        // This seems really counterintuitive but it's how xml2js requires it
        person_name: manuscript.submission.authors.map(
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

  if (config.crossref.licenseUrl)
    journal.journal_article.program = {
      $: {
        name: 'AccessIndicators',
        xmlns: 'http://www.crossref.org/AccessIndicators.xsd',
      },
      license_ref: config.crossref.licenseUrl,
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
          depositor_name: config.crossref.depositorName,
          email_address: config.crossref.depositorEmail,
        },
        registrant: config.crossref.registrant,
      },
      body: {
        journal,
      },
    },
  }

  const xml = builder
    .buildObject(json)
    .replace(ABSTRACT_PLACEHOLDER, htmlToJats(manuscript.meta.abstract))
    .replace(CITATIONS_PLACEHOLDER, citations)

  const dirName = `${+new Date()}-${manuscript.id}`
  await fsPromised.mkdir(dirName)
  const fileName = `submission-${batchId}.xml`
  await fsPromised.appendFile(`${dirName}/${fileName}`, xml)
  const filePath = `${dirName}/${fileName}`
  await requestToCrossref([filePath])
  await fs.rmdirSync(dirName, { recursive: true })
}

const publishReviewsToCrossref = async manuscript => {
  if (
    !manuscript.submission.articleURL ||
    !manuscript.submission.articleURL.startsWith('https://doi.org/')
  )
    throw new Error(
      `Field submission.articleURL is not a DOI link: "${manuscript.submission.articleURL}"`,
    )

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

  const xmls = notEmptyReviews
    .map(reviewNumber => {
      if (!manuscript.submission[`review${reviewNumber}date`]) {
        return null
      }

      const [year, month, day] = parseDate(
        manuscript.submission[`review${reviewNumber}date`],
      )

      const templateCopy = JSON.parse(JSON.stringify(jsonResult))
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].day[0] = day
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].month[0] = month
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].year[0] = year
      templateCopy.doi_batch.head[0].depositor[0].depositor_name[0] =
        config.crossref.depositorName
      templateCopy.doi_batch.head[0].depositor[0].email_address[0] =
        config.crossref.depositorEmail
      templateCopy.doi_batch.head[0].registrant[0] = config.crossref.registrant
      templateCopy.doi_batch.head[0].timestamp[0] = +new Date()
      templateCopy.doi_batch.head[0].doi_batch_id[0] = String(
        +new Date(),
      ).slice(0, 8)

      if (manuscript.submission[`review${reviewNumber}creator`]) {
        const surname = manuscript.submission[
          `review${reviewNumber}creator`
        ].split(' ')[1]

        templateCopy.doi_batch.body[0].peer_review[0].contributors[0].person_name[0] = {
          $: {
            contributor_role: 'reviewer',
            sequence: 'first',
          },
          given_name: [
            manuscript.submission[`review${reviewNumber}creator`].split(' ')[0],
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
      templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] = getDoi(
        `${manuscript.id}/${reviewNumber}`,
      )
      templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${config['pubsweet-client'].baseUrl}/versions/${manuscript.id}/article-evaluation-result/${reviewNumber}`
      templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[0] = {
        // description: [`${manuscript.submission.description}`],
        inter_work_relation: [
          {
            _: manuscript.submission.articleURL.split('.org/')[1],
            $: {
              'relationship-type': 'isReviewOf',
              'identifier-type': 'doi',
            },
          },
        ],
      }

      templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[1] = {
        inter_work_relation: [
          {
            _: getDoi(`${manuscript.id}/`),
            $: {
              'relationship-type': 'isSupplementTo',
              'identifier-type': 'doi',
            },
          },
        ],
      }
      return { reviewNumber, xml: builder.buildObject(templateCopy) }
    })
    .filter(Boolean)

  if (manuscript.submission.summary && manuscript.submission.summarydate) {
    const templateCopy = JSON.parse(JSON.stringify(jsonResult))
    const [year, month, day] = parseDate(manuscript.submission.summarydate)
    templateCopy.doi_batch.body[0].peer_review[0].review_date[0].day[0] = day
    templateCopy.doi_batch.body[0].peer_review[0].review_date[0].month[0] = month
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
      templateCopy.doi_batch.body[0].peer_review[0].contributors[0].person_name[0] = {
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

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] = getDoi(
      `${manuscript.id}/`,
    )

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${config['pubsweet-client'].baseUrl}/versions/${manuscript.id}/article-evaluation-summary`
    templateCopy.doi_batch.body[0].peer_review[0].program[0].related_item[0] = {
      // description: [`${manuscript.submission.description}`],
      inter_work_relation: [
        {
          _: manuscript.submission.articleURL.split('.org/')[1],
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
  // eslint-disable-next-line
  console.log('xml_1')
  // eslint-disable-next-line
  if (xmls[0]) console.log(xmls[0].xml)
  // eslint-disable-next-line
  console.log('xml_2')
  // eslint-disable-next-line
  if (xmls[1]) console.log(xmls[1].xml)
  // eslint-disable-next-line
  console.log('xml_3')
  // eslint-disable-next-line
  if (xmls[2]) console.log(xmls[2].xml)
  // eslint-disable-next-line
  console.log('xml_4')
  // eslint-disable-next-line
  if (xmls[3]) console.log(xmls[3].xml)

  await fsPromised.mkdir(dirName)

  const fileCreationPromises = xmls.map(async xml => {
    const fileName = xml.reviewNumber
      ? `review${xml.reviewNumber}.xml`
      : 'summary.xml'

    await fsPromised.appendFile(`${dirName}/${fileName}`, xml.xml)
    return `${dirName}/${fileName}`
  })

  const xmlFiles = await Promise.all(fileCreationPromises)
  await requestToCrossref(xmlFiles)
  fs.rmdirSync(dirName, {
    recursive: true,
  })
}

module.exports = publishToCrossref
