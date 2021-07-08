/** The UTC date, formatted yyyy-MM-dd */
export const getDateUtcString = date => {
  return date.toISOString().slice(0, 10)
}

/** Add the local timezone offset to mimic a UTC datetime.
 *  E.g. if local time is NZST,
 *  transposeUtcToLocal('2020-01-02 10:00 GMT+1200') = 2020-01-01 22:00 GMT+1200
 *  (since 2 Jan 10:00 NZST = 1 Jan 22:00 UTC) */
export const transposeUtcToLocal = date => {
  const utc = new Date(date)
  const local = utc.getTime() + utc.getTimezoneOffset() * 60000
  return new Date(local)
}

/** Subtract the local timezone offset to convert a mimicked UTC datetime back to normal.
 *  E.g. if local time is NZST,
 *  transposeLocalToUtc('2020-01-01 22:00 GMT+1200') = 2020-01-02 10:00 GMT+1200
 *  (since 1 Jan 22:00 UTC = 2 Jan 10:00 NZST) */
export const transposeLocalToUtc = date => {
  const local = new Date(date)
  const utc = local.getTime() - local.getTimezoneOffset() * 60000
  return new Date(utc)
}

/** Get the most recent UTC 00:00:00.000 for a given date-time */
export const getStartOfDayUtc = date => {
  const d = new Date(date)
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  return d
}

/** Get the next UTC 23:59:59.999 for a given date-time */
export const getEndOfDayUtc = date => {
  const d = new Date(date)
  d.setUTCHours(23)
  d.setUTCMinutes(59)
  d.setUTCSeconds(59)
  d.setUTCMilliseconds(999)
  return d
}
