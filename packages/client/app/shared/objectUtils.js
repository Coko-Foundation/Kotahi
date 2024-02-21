/** Parses if value is a string, otherwise returns value unaltered. */
// eslint-disable-next-line import/prefer-default-export
export const ensureJsonIsParsed = value =>
  typeof value === 'string' ? JSON.parse(value) : value
