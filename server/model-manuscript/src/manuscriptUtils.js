const stripSensitiveItems = manuscript => {
  const result = {
    ...manuscript,
    manuscriptVersions: (manuscript.manuscriptVersions || []).map(v => ({
      ...v,
    })),
  }

  if (result.reviews) {
    result.reviews.forEach((review, index) => {
      delete result.reviews[index].confidentialComment
    })
  }

  if (result.manuscriptVersions) {
    result.manuscriptVersions.forEach((v, vI) => {
      if (v.reviews) {
        v.reviews.forEach((r, rI) => {
          delete result.manuscriptVersions[vI].reviews[rI].confidentialComment
        })
      }
    })
  }

  return result
}

module.exports = {
  stripSensitiveItems,
}
