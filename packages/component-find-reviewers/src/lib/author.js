import map from 'lodash/map'

export const publicationYears = papers => {
  const years = papers.map(paper => paper.year).filter(year => year)

  if (!years.length) return []

  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const output = {}

  for (let year = minYear; year <= maxYear; year += 1) {
    output[year] = 0
  }

  years.forEach(year => {
    output[year] += 1
  })

  const ratio = 50 / Math.max(...Object.values(output))

  return map(output, (count, year) => ({
    year,
    size: Math.max(10, count * ratio),
  })).reverse()
}
