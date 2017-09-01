import striptags from 'striptags'

export const required = value => {
  if (!value) return 'This is required'

  return undefined
}

export const minChars = min => value => {
  const text = striptags(value)

  if (!text || text.length < min) {
    return `Enter at least ${min} characters`
  }

  return undefined
}

export const maxChars = max => value => {
  const text = striptags(value)

  if (!text || text.length > max) {
    return `Enter no more than ${max} characters`
  }

  return undefined
}

export const minSize = min => value => {
  if (!value || value.length < min) {
    return `Enter at least ${min} ${min === 1 ? 'item' : 'items'}`
  }

  return undefined
}
