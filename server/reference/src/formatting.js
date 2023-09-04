const { v4: uuid } = require('uuid')
const fs = require('fs')
const citeproc = require('citeproc-js-node')
const path = require('path')
const Config = require('../../config/src/config')

// Big question about this: is it worth doing this as a microservice? My impulse has been no, but maybe this should be throught about?

// eslint-disable-next-line new-cap
const sys = new citeproc.simpleSys()

const formatCitation = async (stringifiedCSL, groupId) => {
  // This takes stringified CSL. Feeding it an object will not work.
  // The output is JATS-flavored HTML as a string.

  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const localeName =
    activeConfig.formData.publishing.crossref.localeName || 'en-US'

  const styleName = activeConfig.formData.publishing.crossref.styleName || 'apa'

  // console.log('Citeproc settings: ', localeName, styleName)

  // localeName can be either 'en-US' or 'en-GB'

  const localeData = fs.readFileSync(
    path.join(__dirname, `/csl-locales/locales-${localeName}.xml`),
    'utf8',
  )

  sys.addLocale(localeName, localeData)

  // styleName can be any of the files in the csl directory. We might change this in the future to work with an uploaded file

  const styleString = fs.readFileSync(
    path.join(__dirname, `/csl/${styleName}.csl`),
    'utf8',
  )

  const engine = sys.newEngine(styleString, localeName, null)

  let error = ''
  const referenceCSL = {}
  let result = ''

  try {
    // Content needs to be shaped like this:
    // {
    //  "ref1": {
    //		"id": "ref1",
    //		"title": "Adiposity and Cognitive Decline in the Cardiovascular Health Study",
    //		"author": [....]
    //   }
    // }
    // where the id is the key and the rest is the value. If we had an array coming in, turn it into an object
    // console.log('stringifiedCSL: ', stringifiedCSL)
    // console.log(typeof stringifiedCSL)
    const thisRef = `ref-${uuid()}`
    referenceCSL[thisRef] = JSON.parse(stringifiedCSL)
    referenceCSL[thisRef].id = thisRef

    sys.items = referenceCSL

    engine.updateItems(Object.keys(referenceCSL))
    const bib = engine.makeBibliography()
    // bib is the bibliography array. The first item is a metadata object; the second is an array of HTML strings.

    if (bib.length > 1) {
      // We are dealing with the array of HTML strings, the second item in the array.
      const results = bib[1]
      // Even if there's a single result, it's in an array.
      // eslint-disable-next-line prefer-destructuring
      result = results[0]
      // This is CSL-flavored HTML, need to make it JATS-flavored HTML.
      // Not 100% sure that all of the HTML coming out of this will work for us, keep an eye out.
      result = result
        .replace(/<div class="csl-entry">/g, '<p class="ref">')
        .replace(/<\/div>/g, '</p>')
        .replace(/<i>/g, '<em>')
        .replace(/<\/i>/g, '</em>')
        .replace(/<b>/g, '<strong>')
        .replace(/<\/b>/g, '</strong>')
        .trim()
    }
  } catch (e) {
    /*

This (a result coming back from CrossRef) is crashing it:

kotahi-server-1            | Reference CSL:  {
kotahi-server-1            |   '80bb49ae-380d-40e9-978f-61cf7d45211b': {
kotahi-server-1            |     DOI: '10.1016/s0033-3506(73)80126-x',
kotahi-server-1            |     issue: '3',
kotahi-server-1            |     page: '94',
kotahi-server-1            |     title: [
kotahi-server-1            |       'The Work of the World Health Organization in 1971, Annual Report of the Director-General 4071 Geneva World Health Organization 1972 £1.50'
kotahi-server-1            |     ],
kotahi-server-1            |     volume: '87',
kotahi-server-1            |     'container-title': [ 'Public Health' ],
kotahi-server-1            |     id: '80bb49ae-380d-40e9-978f-61cf7d45211b'
kotahi-server-1            |   }
kotahi-server-1            | } 
kotahi-server-1            | 

Plugging this into a CSL validator says that it's missing a type and that title and container-title should not be arrays.
But: arrayed titles are being used for other references that correctly work; they don't have types either.

If we can't format it, we're not showing it as a choice on the front end. It would be nice to fix this though.

*/

    console.error('\n\n\nCiteproc error', e)
    console.error('Reference CSL: ', referenceCSL, '\n\n\n')
    error = e.message
  }

  // console.log('Comming out of formatting.js:', result, error)
  return { result, error }
}

// TODO: We probably want to have a version of this that handles multiple citations – the usecase would be that you have a
// Reference List with citations in it, and you want to alphabetize them according to the formatting rules in the CSL style
// library. Maybe we could do this using the UUID attached to each citation; we could pass back an array of objects, and something
// in the ReferenceList Wax code could use the UUID to match the formatted citation to what it should be inserted into.
//
// Note that this usecase requires us to have CSL versions of all the citations in the Reference List; we might not have that
// because some of the citations might be just strings of text that haven't gone through Crossref or Anystyle. If we fed those in,
// they'd come out in the wrong place because Citeproc won't know how to deal with them.

module.exports = {
  formatCitation,
}
