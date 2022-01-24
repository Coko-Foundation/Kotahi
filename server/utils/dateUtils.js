/** Return [year, month, date] parsed from either yyyy-mm-dd or mm/dd/yyyy format, e.g. return [2021, 7, 23] for '2021-07-23' or '07/23/2021'.
 * To avoid ambiguity, UK format (dd/mm/yyyy) is not supported.
 * This does not ensure that dates are valid; e.g. '04/31/2021' is invalid (only 30 days in April), but is still parsed.
 */
const parseDate = dateString => {
  const date = new Date(dateString)
  if (date.toString() === 'Invalid Date')
    throw new Error(`Invalid date string "${dateString}"`)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

const pad = num => (num < 10 ? `0${num}` : num.toString())

/** From a timestamp, Date or standardly-formatted date string, generate a date string in the form 'YYYY-MM-DD' */
const formatAsIso8601Date = timestampOrDate => {
  const date = new Date(timestampOrDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${pad(month)}-${pad(day)}`
}

module.exports = { parseDate, formatAsIso8601Date }
