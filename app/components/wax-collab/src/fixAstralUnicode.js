const unsupportedAstralsRegex = /[𝒶-𝓏𝓐-𝔃𝕬-𝖟𝘼-𝙯𝚨-𝟋𝟘-𝟡]/gu

/** If char is in the given range, transpose it to a different range beginning at targetRangeStart; otherwise return null */
const tryTranspose = (char, firstInRange, lastInRange, targetRangeStart) => {
  if (char < firstInRange || char > lastInRange) return null
  return String.fromCodePoint(
    char.codePointAt(0) -
      firstInRange.codePointAt(0) +
      targetRangeStart.codePointAt(0),
  )
}

/** Convert unsupported unicode characters to similar supported ones.
 * This is a destructive change, since the manuscript data will end up modified in the DB.
 * Once there is a fix in Wax, we should remove this.
 * See https://gitlab.coko.foundation/kotahi/kotahi/-/issues/693
 */
const fixAstralUnicode = value => {
  const fragments = []
  let lastMatchEnd = 0

  while (true) {
    const match = unsupportedAstralsRegex.exec(value)
    if (!match) break
    fragments.push(value.substring(lastMatchEnd, match.index))
    const c = match[0]

    if (c === '𝒽') fragments.push('ℎ')
    else if (c === '𝓑') fragments.push('ℬ')
    else if (c === '𝓔') fragments.push('ℰ')
    else if (c === '𝓕') fragments.push('ℱ')
    else if (c === '𝓗') fragments.push('ℋ')
    else if (c === '𝓘') fragments.push('ℐ')
    else if (c === '𝓛') fragments.push('ℒ')
    else if (c === '𝓜') fragments.push('ℳ')
    else if (c === '𝓡') fragments.push('ℛ')
    else if (c === '𝕮') fragments.push('ℭ')
    else if (c === '𝕳') fragments.push('ℌ')
    else if (c === '𝕴') fragments.push('ℑ')
    else if (c === '𝕽') fragments.push('ℜ')
    else if (c === '𝖅') fragments.push('ℨ')
    else if (c === '𝚹' || c === '𝛳' || c === '𝜭' || c === '𝝧' || c === '𝞡')
      fragments.push('ϴ')
    else if (c === '𝛁' || c === '𝛻' || c === '𝜵' || c === '𝝯' || c === '𝞩')
      fragments.push('∇')
    else if (c === '𝛛' || c === '𝜕' || c === '𝝏' || c === '𝞉' || c === '𝟃')
      fragments.push('∂')
    else if (c === '𝛜' || c === '𝜖' || c === '𝝐' || c === '𝞊' || c === '𝟄')
      fragments.push('ϵ')
    else if (c === '𝛝' || c === '𝜗' || c === '𝝑' || c === '𝞋' || c === '𝟅')
      fragments.push('ϑ')
    else if (c === '𝛞' || c === '𝜘' || c === '𝝒' || c === '𝞌' || c === '𝟆')
      fragments.push('ϰ')
    else if (c === '𝛟' || c === '𝜙' || c === '𝝓' || c === '𝞍' || c === '𝟇')
      fragments.push('ϕ')
    else if (c === '𝛠' || c === '𝜚' || c === '𝝔' || c === '𝞎' || c === '𝟈')
      fragments.push('ϱ')
    else if (c === '𝛡' || c === '𝜛' || c === '𝝕' || c === '𝞏' || c === '𝟉')
      fragments.push('ϖ')
    else if (c === '𝟊') fragments.push('Ϝ')
    else if (c === '𝟋') fragments.push('ϝ')
    else {
      fragments.push(
        tryTranspose(c, '𝒶', '𝓏', '𝑎') ||
          tryTranspose(c, '𝓪', '𝔃', '𝒂') ||
          tryTranspose(c, '𝓐', '𝓩', '𝒜') ||
          tryTranspose(c, '𝕬', '𝖟', '𝔄') ||
          tryTranspose(c, '𝘼', '𝙯', '𝑨') ||
          tryTranspose(c, '𝚨', '𝛀', 'Α') ||
          tryTranspose(c, '𝛢', '𝛺', 'Α') ||
          tryTranspose(c, '𝜜', '𝜴', 'Α') ||
          tryTranspose(c, '𝝖', '𝝮', 'Α') ||
          tryTranspose(c, '𝞐', '𝞨', 'Α') ||
          tryTranspose(c, '𝛂', '𝛚', 'α') ||
          tryTranspose(c, '𝛼', '𝜔', 'α') ||
          tryTranspose(c, '𝜶', '𝝎', 'α') ||
          tryTranspose(c, '𝝰', '𝞈', 'α') ||
          tryTranspose(c, '𝞪', '𝟂', 'α') ||
          tryTranspose(c, '𝟘', '𝟡', '𝟎') ||
          '',
      )
    }

    lastMatchEnd = match.index + c.length
  }

  if (lastMatchEnd === 0) return value // Avoid string copy for simplest case

  fragments.push(value.substring(lastMatchEnd))

  return fragments.join('')
}

export default fixAstralUnicode
