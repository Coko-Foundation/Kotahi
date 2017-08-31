export const required = value => (value ? undefined : 'Required')

export const minChars = min => value => value && value.length >= min ? undefined : `There should be at least ${min} characters`

export const maxChars = max => value => value && value.length <= max ? undefined : `There should be no more than ${max} characters`

export const minSize = min => value => value && value.length >= min ? undefined : `There should be at least ${min} items`

