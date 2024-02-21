/** Find the named GET param in the URI, decode any plus-encoding and percent-encoding, and return the decoded value */
function getQueryStringByName(name, url = window.location.href) {
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

const isParamNonrepeatedAndNonempty = (param, i, self) =>
  self.findIndex(x => x.field === param.field) === i && param.value

/** Matches GET params like '?param=val' or '&param=val', with capture groups for the key and the value */
const paramRegex = /[?&](\w[\w.]*)=([^&#]+)/g

/** Get the GET params from the URI, decode percent- and plus-encoding, and return as an object of keys mapped to values.
 * If a key is duplicated, only the last value will be returned for that key. */
const getUriQueryParams = uri => {
  // Note: the following equivalent code is considered inefficient by the linter, and because it relies on the browser it's not unit testable.
  /*
  const result = []
  for (let val of new URL(window.location).searchParams.entries())
    result.push({ field: val[0], value: val[1] })
  */

  const result = []

  while (true) {
    const match = paramRegex.exec(uri)
    if (!match) break
    result.push({
      field: match[1],
      value: decodeURIComponent(match[2].replaceAll('+', ' ')),
    })
  }

  return result.filter(isParamNonrepeatedAndNonempty)
}

export { getUriQueryParams, getQueryStringByName }
