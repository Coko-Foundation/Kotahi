const mathBlockRegex = /(?:(?<=<math-inline class="math-node">)|(?<=<math-display class="math-node">))(?:(?!<\/math-(?:inline|display)>)[\s\S])+(?=<\/math-(?:inline|display)>)/g
const dollarDelimiterRegex = /(?:(?<=<math-inline class="math-node">)|(?<=<math-display class="math-node">))\s*\$\$?|\$\$?\s*(?=<\/math-(?:inline|display)>)/g
const mathbfitRegex = /\\mathbfit\{/g
const leftRegex = /\\left\b/g
const rightRegex = /\\right\b/g

/** XSweet sometimes supplies mismatched sequences of '\left' and '\right' etc.
 * These LaTeX functions turn normal brackets ()[]{} etc into variable-height brackets.
 * KaTeX doesn't like these mismatched, so if counts of \left and \right are not equal
 * in a math expression, we simply strip all \left and \right, so that the brackets
 * that follow revert to normal height. */
const fixMismatchedBrackets = html => {
  const fragments = []
  let lastIndex = 0

  while (true) {
    const mathBlockMatch = mathBlockRegex.exec(html)
    if (!mathBlockMatch) break
    fragments.push(html.substring(lastIndex, mathBlockMatch.index))

    const leftCount = (mathBlockMatch[0].match(leftRegex) || []).length
    const rightCount = (mathBlockMatch[0].match(rightRegex) || []).length

    if (leftCount === rightCount) {
      fragments.push(mathBlockMatch[0])
    } else {
      const strippedMath = mathBlockMatch[0]
        .replace(leftRegex, '')
        .replace(rightRegex, '')

      fragments.push(strippedMath)
    }

    lastIndex = mathBlockMatch.index + mathBlockMatch[0].length
  }

  fragments.push(html.substring(lastIndex))

  return fragments.join('')
}

/** Simplify LaTeX math elements that KaTeX can't understand. */
const cleanMathMarkup = html => {
  let result = html
    .replace(dollarDelimiterRegex, '')
    .replace(mathbfitRegex, '\\mathbf{') // TODO KaTeX isn't supporting \mathbfit, and I haven't found another way to get bold-italic. This just gives bold.
    .replaceAll('\\hbox{', '{')

  result = fixMismatchedBrackets(result)
  return result
}

export default cleanMathMarkup
