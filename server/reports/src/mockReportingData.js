const personNames = [
  'Joe Bloggs',
  'Abigail Avery',
  'Bernard Baker',
  'Calvin Carter',
  'Debbie Duke',
  'Ed Eager',
  'Frances Fitch',
  'Gail Gorey',
  'Hortense Hyatt',
  'Ivor Inders',
  'Jasper Jones',
  'Kathe Koja',
  'Lewis Lee',
  'Martha Mann',
  'Ned Nevis',
  'Oscar Opie',
  'Penny Pinter',
  'Quentin Quell',
  'Rachel Redmond',
  'Sam Suiter',
  'Tom Taylor',
  'Ursula Underwood',
  'Val Vincent',
  'Wayne White',
  'Xanthe Xavier',
  'Yolande Yurginson',
  'Zoe Ziff',
]

const randomInt = max => Math.floor(Math.random() * max)
const lowishRandomInt = max => Math.floor(Math.random() ** 2 * max)
const highishRandomInt = max => Math.floor(Math.random() ** 0.5 * max)
const randomName = () => personNames[randomInt(personNames.length)]

const generateAuthorsData = () => {
  const result = []

  for (let i = 0; i < 50; i += 1) {
    const submittedCount = lowishRandomInt(3)
    const rejectedCount = lowishRandomInt(submittedCount + 1)
    const acceptedCount = randomInt(submittedCount - rejectedCount + 1)
    result.push({
      name: randomName(),
      unsubmittedCount: Math.floor(Math.random() ** 4 * 10),
      submittedCount,
      rejectedCount,
      revisionCount: randomInt(submittedCount - rejectedCount + 1),
      acceptedCount,
      publishedCount: highishRandomInt(acceptedCount + 1),
    })
  }

  return result
}

module.exports = {
  generateAuthorsData,
}
