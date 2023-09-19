// validation.js

const path = require('path')
const xsd = require('libxmljs2-xsd')

// Given JATS as a string, this validates it against the JATS schema.
// If there are errors, it logs them to the console as errors; it reuturns an array of errors.
// If there are no errors, it returns an empty array.

const validateJats = jats => {
  const jatsXsdPath = path.join(
    __dirname,
    './schemas/JATS-journalpublishing1-3-mathml3.xsd',
  )

  const schema = xsd.parseFile(jatsXsdPath)
  const validationErrors = schema.validate(jats)

  if (validationErrors) {
    console.error(
      `${validationErrors.length} JATS validation error${
        validationErrors.length > 1 ? 's' : ''
      }:`,
    )
    return validationErrors.map(x => ({ ...x, message: x.message })) // message added explicitly because it's not enumerable in Error
  }

  return [] // This comes back as null if it's valid, changing this to [].
}

module.exports = validateJats
