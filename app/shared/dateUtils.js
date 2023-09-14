import moment from 'moment-timezone'

const tzOffset = new Date().getTimezoneOffset()

/** Turn e.g. midday in the supplied timezone into midday in local timezone */
export const transposeFromTimezoneToLocal = (date, timezone) => {
  const timestamp = new Date(date).getTime()
  const localOffsetMinutes = new Date().getTimezoneOffset()
  const tzOffsetMinutes = moment.tz.zone(timezone).utcOffset(timestamp)
  const totalOffsetMilliseconds = (localOffsetMinutes - tzOffsetMinutes) * 60000
  return new Date(timestamp + totalOffsetMilliseconds)
}

/** Turn e.g. midday in local timezone into midday in the supplied timezone */
export const transposeFromLocalToTimezone = (date, timezone) => {
  const timestamp = new Date(date).getTime()
  const localOffsetMinutes = new Date().getTimezoneOffset()
  const tzOffsetMinutes = moment.tz.zone(timezone).utcOffset(timestamp)
  const totalOffsetMilliseconds = (localOffsetMinutes - tzOffsetMinutes) * 60000
  return new Date(timestamp - totalOffsetMilliseconds)
}

/** Format date as yyyy-MM-dd (using timezone if supplied, otherwise UTC) */
export const dateToIso8601 = (date, timezoneOffsetMinutes) => {
  return (timezoneOffsetMinutes
    ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
    : new Date(date)
  )
    .toISOString()
    .slice(0, 10)
}

/** Format date as yyyyMMdd (using timezone if supplied, otherwise UTC) */
export const dateToCompactString = (date, timezoneOffsetMinutes) =>
  dateToIso8601(date, timezoneOffsetMinutes).replaceAll('-', '')

/** Format date as yyyyMMdd using local timezone */
export const dateToCompactStringLocal = date =>
  dateToCompactString(date, tzOffset)

/** Convert yyyyMMdd string into a date (midnight at start of day), using timezone if supplied, otherwise UTC */
export const compactStringToDate = (compactString, timezoneOffsetMinutes) => {
  const isoString = `${compactString.substring(0, 4)}-${compactString.substring(
    4,
    6,
  )}-${compactString.substring(6, 8)}T00:00:00.000Z`

  const date = new Date(isoString)
  if (timezoneOffsetMinutes)
    return transposeTimezoneToUtc(date, timezoneOffsetMinutes)
  return date
}

/** Convert yyyyMMdd string into a date (midnight at start of day), using the local timezone */
export const compactStringToDateLocal = compactString =>
  compactStringToDate(compactString, tzOffset)

/** Add the local timezone offset to mimic a UTC datetime.
 *  E.g. if local time is NZST,
 *  transposeUtcToLocal('2020-01-02 10:00 GMT+1200') = 2020-01-01 22:00 GMT+1200
 *  (since 2 Jan 10:00 NZST = 1 Jan 22:00 UTC) */
export const transposeUtcToLocal = date =>
  transposeUtcToTimezone(date, tzOffset)

export const transposeUtcToTimezone = (date, timezoneOffsetMinutes) => {
  const utc = new Date(date)
  const local = utc.getTime() - timezoneOffsetMinutes * 60000
  return new Date(local)
}

/** Subtract the local timezone offset to convert a mimicked UTC datetime back to normal.
 *  E.g. if local time is NZST,
 *  transposeLocalToUtc('2020-01-01 22:00 GMT+1200') = 2020-01-02 10:00 GMT+1200
 *  (since 1 Jan 22:00 UTC = 2 Jan 10:00 NZST) */
export const transposeLocalToUtc = date =>
  transposeTimezoneToUtc(date, tzOffset)

export const transposeTimezoneToUtc = (date, timezoneOffsetMinutes) => {
  const local = new Date(date)
  const utc = local.getTime() + timezoneOffsetMinutes * 60000
  return new Date(utc)
}

/** Get the most recent UTC 00:00:00.000 for a given date-time */
export const getStartOfDay = (date, timezoneOffsetMinutes) => {
  const dayStartUtc = new Date(
    timezoneOffsetMinutes
      ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
      : date,
  )

  dayStartUtc.setUTCHours(0)
  dayStartUtc.setUTCMinutes(0)
  dayStartUtc.setUTCSeconds(0)
  dayStartUtc.setUTCMilliseconds(0)
  return timezoneOffsetMinutes
    ? transposeTimezoneToUtc(dayStartUtc, timezoneOffsetMinutes)
    : dayStartUtc
}

/** Get the next UTC 23:59:59.999 for a given date-time */
export const getEndOfDay = (date, timezoneOffsetMinutes) => {
  const dayEndUtc = new Date(
    timezoneOffsetMinutes
      ? transposeUtcToTimezone(date, timezoneOffsetMinutes)
      : date,
  )

  dayEndUtc.setUTCHours(23)
  dayEndUtc.setUTCMinutes(59)
  dayEndUtc.setUTCSeconds(59)
  dayEndUtc.setUTCMilliseconds(999)
  return timezoneOffsetMinutes
    ? transposeTimezoneToUtc(dayEndUtc, timezoneOffsetMinutes)
    : dayEndUtc
}

/** Return [year, month, date] parsed from either yyyy-mm-dd or mm/dd/yyyy format, e.g. return [2021, 7, 23] for '2021-07-23' or '07/23/2021'.
 * To avoid ambiguity, UK format (dd/mm/yyyy) is not supported.
 * This does not ensure that dates are valid; e.g. '04/31/2021' is invalid (only 30 days in April), but is still parsed.
 */
export const parseDate = dateString => {
  const date = new Date(dateString)
  if (date.toString() === 'Invalid Date')
    throw new Error(`Invalid date string "${dateString}"`)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

const pad = num => (num < 10 ? `0${num}` : num.toString())

const monthAbbrevs = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const convertTimestampToDateString = timestamp => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours < 12 ? 'am' : 'pm'
  const cleanHours = ((hours + 11) % 12) + 1

  return `${month} ${pad(day)}, ${year} ${cleanHours}:${pad(minutes)}${ampm}`
}

export const convertTimestampToDateWithoutTimeString = timestamp => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()

  return `${month} ${pad(day)}, ${year}`
}

export const convertTimestampToDateWithTimeString = timestamp => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = monthAbbrevs[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${month} ${pad(day)}, ${year} ${pad(hours)}:${pad(minutes)}`
}

export const convertTimestampToTimeString = timestamp => {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return `${pad(hours)}:${pad(minutes)}`
}

export const convertTimestampToRelativeDateString = timestamp => {
  const updatedTime = new Date(timestamp)
  const currTime = new Date()
  const diff = Math.round((currTime - updatedTime) / (1000 * 3600 * 24))

  if (diff === 0) {
    return 'today'
  }

  if (diff === 1) {
    return 'yesterday'
  }

  if (diff <= 7) {
    return `${diff} days ago`
  }

  return convertTimestampToDateWithoutTimeString(timestamp)
}

export const convertTimestampToDateTimeString = timestamp => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
