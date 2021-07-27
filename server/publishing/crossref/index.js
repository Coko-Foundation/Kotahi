const FormData = require('form-data')
const fsPromised = require('fs').promises
const fs = require('fs')
const xml2js = require('xml2js')
const axios = require('axios')
const path = require('path')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')

const builder = new xml2js.Builder()
const parser = new xml2js.Parser()

const sequenceMapping = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
}

const requestToCrossref = async xmlFiles => {
  console.log('requestToCrossref')

  const publishPromises = xmlFiles.map(async file => {
    const formData = new FormData()
    formData.append('login_id', process.env.CROSSREF_LOGIN)
    formData.append('login_passwd', process.env.CROSSREF_PASSWORD)
    formData.append('fname', fs.createReadStream(file))

    // const crossrefURL =
    //   process.env.NODE_ENV === 'production'
    //     ? 'https://doi.crossref.org/servlet/deposit'
    //     : 'https://test.crossref.org/servlet/deposit'

    const crossrefURL = 'https://test.crossref.org/servlet/deposit'

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

const generateElifeDOI = (manuscriptId, reviewNumber) => {
  const prefix = '10.7554/'
  let suffix = `${manuscriptId}/`

  if (reviewNumber) {
    suffix += reviewNumber
  }

  return prefix + suffix
}

const publishToCrossref = async manuscript => {
  const template = await fsPromised.readFile(
    path.resolve(__dirname, 'crossref_publish_xml_template.xml'),
  )

  const notEmptyReviews = Object.entries(manuscript.submission)
    .filter(
      ([prop, value]) =>
        prop.length === 7 &&
        prop.includes('review') &&
        !checkIsAbstractValueEmpty(value),
    )
    .map(([reviewNr]) => reviewNr.replace('review', ''))

  const jsonResult = await parser.parseStringPromise(template)

  console.log('notEmptyReviews')
  console.log(notEmptyReviews)

  const xmls = notEmptyReviews
    .map(reviewNumber => {
      if (!manuscript.submission[`review${reviewNumber}date`]) {
        return null
      }

      const [month, day, year] = manuscript.submission[
        `review${reviewNumber}date`
      ].split('/')

      const templateCopy = JSON.parse(JSON.stringify(jsonResult))
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].day[0] = day
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].month[0] = month
      templateCopy.doi_batch.body[0].peer_review[0].review_date[0].year[0] = year
      templateCopy.doi_batch.head[0].depositor[0].depositor_name[0] =
        'eLife Kotahi'
      templateCopy.doi_batch.head[0].depositor[0].email_address[0] =
        'elife-kotahi@kotahi.cloud'
      templateCopy.doi_batch.head[0].registrant[0] = 'eLife'
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
            sequence: sequenceMapping[reviewNumber],
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
      templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] = generateElifeDOI(
        manuscript.id,
        reviewNumber,
      )
      templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${process.env.PUBLIC_CLIENT_PROTOCOL}://${process.env.PUBLIC_CLIENT_HOST}:${process.env.PUBLIC_CLIENT_PORT}/versions/${manuscript.id}/article-evaluation-result/${reviewNumber}`
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
            _: `10.7554/${manuscript.id}`,
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

  console.log('after xmls')

  if (manuscript.submission.summary && manuscript.submission.summarydate) {
    const templateCopy = JSON.parse(JSON.stringify(jsonResult))
    const [month, day, year] = manuscript.submission.summarydate.split('/')
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
          sequence: 'fourth',
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

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].doi[0] = generateElifeDOI(
      manuscript.id,
    )

    templateCopy.doi_batch.body[0].peer_review[0].doi_data[0].resource[0] = `${process.env.PUBLIC_CLIENT_PROTOCOL}://${process.env.PUBLIC_CLIENT_HOST}:${process.env.PUBLIC_CLIENT_PORT}/versions/${manuscript.id}/article-evaluation-summary`
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

  console.log('after submission summary')

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

  console.log('before mkdir')
  await fsPromised.mkdir(dirName)

  const fileCreationPromises = xmls.map(async xml => {
    const fileName = xml.reviewNumber
      ? `review${xml.reviewNumber}.xml`
      : 'summary.xml'

    await fsPromised.appendFile(`${dirName}/${fileName}`, xml.xml)
    return `${dirName}/${fileName}`
  })

  console.log('xmls are created')

  const xmlFiles = await Promise.all(fileCreationPromises)
  await requestToCrossref(xmlFiles)
  fs.rmdirSync(dirName, {
    recursive: true,
  })
}

module.exports = publishToCrossref
