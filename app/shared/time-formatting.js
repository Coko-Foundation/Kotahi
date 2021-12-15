/* eslint-disable import/prefer-default-export */

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

const pad = num => (num < 10 ? `0${num}` : num.toString())

export const convertTimestampToDate = timestamp => {
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
