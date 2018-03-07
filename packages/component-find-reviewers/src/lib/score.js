const highestScoreFirst = (a, b) => b.scorePercent - a.scorePercent

const normalizeScore = papers => {
  const maxScore = papers.reduce((output, paper) => output + paper.score, 0)

  return item => {
    item.scorePercent = item.score / maxScore * 100
  }
}

const normalizeDocScore = maxScore => doc => {
  doc._source.score = doc._score
  doc._source.scorePercent = doc._score / maxScore * 100
}

export const calculatePaperScores = data => {
  const docs = data.hits

  docs.forEach(normalizeDocScore(data.max_score))

  return docs.map(doc => doc._source)
}

export const calculateAuthorScores = papers => {
  const items = papers.reduce((output, paper) => {
    paper.authors.forEach(author => {
      const { ids, name } = author

      const id = ids[0]

      if (!id) return

      if (!output[id]) {
        output[id] = {
          id,
          name,
          score: 0,
          papers: [],
        }
      }

      // some papers have duplicate authors :(
      if (output[id].papers.some(item => item.id === paper.id)) return

      output[id].score += paper.score
      output[id].papers.push(paper)
    })

    return output
  }, {})

  const authors = Object.values(items)
  authors.forEach(normalizeScore(papers))
  authors.sort(highestScoreFirst)

  return authors
}
