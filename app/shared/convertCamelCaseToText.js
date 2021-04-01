export function convertCamelCaseToText (text) {
    const result = text.replace( /([A-Z])/g, " $1" )
    const finalResult = result.charAt(0) + result.slice(1)
    return finalResult.toLowerCase()
  }