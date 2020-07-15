export const convertTimestampToDate = timestamp => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const date = new Date(timestamp)
  const day = date.getDate()
  const monthIndex = date.getMonth()
  const month = monthNames[monthIndex]
  const year = date.getFullYear()
  const hours = date.getHours() || 0
  let cleanHours
  if (hours === 0) {
    cleanHours = 12 // if timestamp is between midnight and 1am, show 12:XX am
  } else {
    cleanHours = hours > 12 ? hours - 12 : hours // else show proper am/pm -- todo: support 24hr time
  }
  let minutes = date.getMinutes()
  minutes = minutes >= 10 ? minutes : `0${minutes.toString()}` // turns 4 minutes into 04 minutes
  const ampm = hours >= 12 ? 'pm' : 'am' // todo: support 24hr time
  return `${month} ${day}, ${year} at ${cleanHours}:${minutes}${ampm}`
}
