const isParamNonrepeatedAndNonempty = (param, i, self) =>
  self.findIndex(x => x.field === param.field) === i && param.value

/** Get the GET params from the URI, decode percent- and plus-encoding, and return as an object of keys mapped to values.
 * If a key is duplicated, only the last value will be returned for that key. */
const getUriQueryParams = uri => {
  // Note: the following equivalent code is considered inefficient and heavyweight by the linter
  /*
  const result = []
  for (let val of new URL(window.location).searchParams.entries())
    result.push({ field: val[0], value: val[1] })
  */

  const paramRegex = /[?&](\w[\w.]*)=([^&#]+)/g
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

export default getUriQueryParams
