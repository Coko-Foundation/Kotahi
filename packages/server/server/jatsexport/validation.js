// validation.js

const path = require('path')
const fs = require('fs-extra').promises
const validateSchema = require('xsd-validator').default

// NOTE: to get this to work locally on an Apple Silicon Mac, I need to go into the server,
// find `/node_modules/libxmljs`, delete the `build` directory, and then run `npm rebuild libxmljs`.

// Given JATS as a string, this validates it against the JATS schema.
// If there are errors, it logs them to the console as errors; it reuturns an array of errors.
// If there are no errors, it returns an empty array.

const validateJats = async jats => {
  const jatsXsdPath = path.join(
    __dirname,
    './schemas/JATS-journalpublishing1-3-mathml3.xsd',
  )

  const schema = (await fs.readFile(jatsXsdPath)).toString()
  const result = validateSchema(jats, schema) // this returns true is valid, or an array of errors if not.

  if (result.length) {
    console.error(
      `${result.length} JATS validation error${result.length > 1 ? 's' : ''}:`,
    )
    return result.map(x => ({ ...x, message: x.message })) // message added explicitly because it's not enumerable in Error
  }

  return [] // This comes back as true if the JATS is valid, changing this to [].
}

module.exports = validateJats
