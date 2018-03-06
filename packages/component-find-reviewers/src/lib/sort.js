export const alphabetical = (a, b) => {
  if (a.title === b.title) return 0

  return a.title > b.title ? 1 : -1
}

export const newestFirst = (a, b) => {
  if (a.year === b.year) return alphabetical(a, b)

  return b.year - a.year
}
