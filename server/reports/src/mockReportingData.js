const Color = require('color')

const generateDurationsData = () => {
  const result = []
  let prevDate = Date.now()

  for (let i = 0; i < 100; i += 1) {
    const date = prevDate + Math.random() * Math.random() * 24 * 60 * 60
    const reviewDuration = Math.random() * Math.random() * 15 + 0.5

    const fullDuration =
      reviewDuration + Math.random() * Math.random() * 9 + 0.5

    result.push({ date, reviewDuration, fullDuration })
    prevDate = date
  }

  return result
}

const generateSummaryData = () => {
  return {
    avgPublishTimeDays: 8.765,
    avgReviewTimeDays: 5.678,
    unsubmittedCount: 12,
    submittedCount: 34,
    unassignedCount: 5,
    reviewInvitedCount: 27,
    reviewInviteAcceptedCount: 25,
    reviewedCount: 18,
    rejectedCount: 4,
    revisingCount: 9,
    acceptedCount: 5,
    publishedCount: 4,
    publishedTodayCount: 4,
    avgPublishedDailyCount: 2.7,
    avgRevisingDailyCount: 11.3,
    durationsData: generateDurationsData(),
  }
}

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

const generateResearchObjectsData = () => {
  const result = []

  for (let i = 0; i < 50; i += 1) {
    result.push({
      id: (1234 + i).toString(),
      entryDate: '2021-05-10',
      title: `Manuscript ${1234 + i}`,
      authorName: randomName(),
      editors: [{ name: randomName() }, { name: randomName() }],
      reviewers: [
        { name: randomName() },
        { name: randomName() },
        { name: randomName() },
      ],
      status: 'Reviewed',
      publishedDate: '2021-05-23',
    })
  }

  return result
}

const generateEditorsData = () => {
  const result = []

  for (let i = 0; i < 50; i += 1) {
    const assignedCount = highishRandomInt(40)
    const givenToReviewersCount = highishRandomInt(assignedCount + 1)
    const rejectedCount = lowishRandomInt(givenToReviewersCount + 1)

    const acceptedCount = highishRandomInt(
      givenToReviewersCount - rejectedCount + 1,
    )

    result.push({
      name: randomName(),
      assignedCount,
      givenToReviewersCount,
      revisedCount: randomInt(givenToReviewersCount + 1),
      rejectedCount,
      acceptedCount,
      publishedCount: highishRandomInt(acceptedCount + 1),
    })
  }

  return result
}

const generateReviewersData = () => {
  const result = []

  for (let i = 0; i < 50; i += 1) {
    const invitesCount = lowishRandomInt(8)
    const declinedCount = lowishRandomInt(invitesCount + 1)

    const reviewsCompletedCount = highishRandomInt(
      invitesCount - declinedCount + 1,
    )

    const reccReviseCount = randomInt(reviewsCompletedCount + 1)

    const reccAcceptCount = highishRandomInt(
      reviewsCompletedCount - reccReviseCount + 1,
    )

    result.push({
      name: randomName(),
      invitesCount,
      declinedCount,
      reviewsCompletedCount,
      avgReviewDuration:
        reviewsCompletedCount > 0 ? lowishRandomInt(20) / 2 + 0.5 : 0,
      reccReviseCount,
      reccAcceptCount,
      reccRejectCount:
        reviewsCompletedCount - reccReviseCount - reccAcceptCount,
    })
  }

  return result
}

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

const getBarColor = (
  barIndex,
  barsCount,
  lightness = 0.6,
  saturation = 0.6,
) => {
  const baseHue = 243
  const targetHue = 22

  const hue =
    barIndex === 0
      ? baseHue
      : baseHue + ((targetHue - baseHue) * barIndex) / (barsCount - 1)

  return Color.hsl(hue, saturation * 100, lightness * 100).hex()
}

const getEditorsConcentricBarChartData = () => {
  const data = [
    { name: 'All manuscripts', value: 123 },
    { name: 'Submitted', value: 103 },
    { name: 'Editor assigned', value: 85 },
    { name: 'Decision complete', value: 32 },
    { name: 'Accepted', value: 21 },
    { name: 'Published', value: 18 },
  ]

  const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))
  const labelColors = data.map((_, i) => getBarColor(i, data.length, 0.3, 1.0))
  return { data, barColors, labelColors }
}

const getReviewersConcentricBarChartData = () => {
  const data = [
    { name: 'All manuscripts', value: 123 },
    { name: 'Reviewer invited', value: 83 },
    { name: 'Invite accepted', value: 62 },
    { name: 'Review completed', value: 38 },
  ]

  const barColors = data.map((_, i) => getBarColor(i, data.length, 0.6))
  const labelColors = data.map((_, i) => getBarColor(i, data.length, 0.3, 1.0))
  return { data, barColors, labelColors }
}

module.exports = {
  generateDurationsData,
  generateSummaryData,
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  generateAuthorsData,
  getEditorsConcentricBarChartData,
  getReviewersConcentricBarChartData,
}
