import _ from 'lodash'

/**
 * Return a deep clone of the object, skipping all items that are null, undefined, '' or {}.
 */
const pruneEmpty = obj => {
  return (function prune(current) {
    _.forOwn(current, (value, key) => {
      if (
        _.isUndefined(value) ||
        _.isNull(value) ||
        _.isNaN(value) ||
        (_.isString(value) && _.isEmpty(value)) ||
        (_.isObject(value) && _.isEmpty(prune(value)) && !_.isArray(value))
      ) {
        // eslint-disable-next-line no-param-reassign
        delete current[key]
      }
    })
    // remove any leftover undefined values from the delete
    // operation on an array
    if (_.isArray(current)) _.pull(current, undefined)

    return current
  })(_.cloneDeep(obj)) // Do not modify the original object, create a clone instead
}

export default pruneEmpty
