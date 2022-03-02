const MAX_REVIEW_COUNT = 10

const hasText = v =>
  v &&
  v !== '<p></p>' &&
  v !== '<p class="paragraph"></p>' &&
  typeof v === 'string'

/** Gets fieldNames and (optional) tags from a comma-separated list with with each field optionally followed by colon and tag name.
 * If fieldName is 'reviews', this is converted into multiple fields 'review#0', 'review#1' etc up to MAX_REVIEW_COUNT.
 * Field names containing '#' are not permitted in the input comma-separated list, though.
 */
const getFieldNamesAndTags = fieldsString => {
  if (!fieldsString) return []

  return fieldsString
    .split(',')
    .map(f => {
      const parts = f.split(':')
      const fieldName = parts[0].trim()
      const tag = parts[1] ? parts[1].trim() : null

      if (fieldName === 'reviews') {
        return [...Array(MAX_REVIEW_COUNT).keys()].map(i => ({
          fieldName: `review#${i}`,
          tag,
        }))
      }

      if (fieldName.includes('#')) {
        console.error(
          `Ignoring misconfigured field "${fieldName}" containing "#" in HYPOTHESIS_PUBLISH_FIELDS.`,
        )
        return []
      }

      return { fieldName, tag }
    })
    .flat()
    .filter(
      (f, i, arr) =>
        f.fieldName && arr.findIndex(x => x.fieldName === f.fieldName) === i, // exclude blank or repeated fieldNames
    )
}

module.exports = { hasText, getFieldNamesAndTags, MAX_REVIEW_COUNT }
