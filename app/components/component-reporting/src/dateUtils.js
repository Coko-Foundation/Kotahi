export const getDateUtcString = date => {
  return date.toISOString().slice(0, 10)
}

export const getStartOfDayUtc = date => {
  const d = new Date(date)
  d.setUTCHours(0)
  d.setUTCMinutes(0)
  d.setUTCSeconds(0)
  d.setUTCMilliseconds(0)
  return d
}

export const getEndOfDayUtc = date => {
  const d = new Date(date)
  d.setUTCHours(23)
  d.setUTCMinutes(59)
  d.setUTCSeconds(59)
  d.setUTCMilliseconds(999)
  return d
}
