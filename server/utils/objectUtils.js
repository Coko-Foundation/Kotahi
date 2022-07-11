const { mergeWith, isArray } = require('lodash')

const replaceArrays = (destination, source) => {
  if (isArray(destination)) return source
  return undefined
}

/** Returns a deep-merge of baseObj and objToMerge.
 * If a field with the same path exists in both baseObj and objToMerge, the resulting value will come from objToMerge.
 * Two arrays at the same path are not merged, but replaced with the array from objToMerge. */
const deepMergeObjectsReplacingArrays = (baseObj, objToMerge) => {
  return mergeWith(baseObj, objToMerge, replaceArrays)
}

/** Parses if value is a string, otherwise returns value unaltered. */
const ensureJsonIsParsed = value =>
  typeof value === 'string' ? JSON.parse(value) : value

module.exports = { deepMergeObjectsReplacingArrays, ensureJsonIsParsed }
