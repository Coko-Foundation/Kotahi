import { convertTimestampToDate } from '../time-formatting'

describe('convertTimestampToDate', () => {
  test('convert', () => {
    expect(convertTimestampToDate(Date.parse('2020-01-01 00:00'))).toEqual(
      'Jan 01, 2020 12:00am',
    )
    expect(convertTimestampToDate(Date.parse('2020-01-01 00:01'))).toEqual(
      'Jan 01, 2020 12:01am',
    )
    expect(convertTimestampToDate(Date.parse('2020-01-01 11:59'))).toEqual(
      'Jan 01, 2020 11:59am',
    )
    expect(convertTimestampToDate(Date.parse('2020-01-01 12:00'))).toEqual(
      'Jan 01, 2020 12:00pm',
    )
    expect(convertTimestampToDate(Date.parse('2020-01-01 23:59'))).toEqual(
      'Jan 01, 2020 11:59pm',
    )
  })
})
