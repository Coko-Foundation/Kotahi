const validateApiToken = (tokenFromClient, permittedTokensString) => {
  const permittedTokens = permittedTokensString
    .split(',')
    .map(t => t.trim())
    .filter(t => !!t)

  if (!permittedTokens.includes(tokenFromClient))
    throw new Error('Unauthorized token!')
}

module.exports = validateApiToken
