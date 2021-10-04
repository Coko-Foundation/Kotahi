const { parseDate } = require('../dateUtils')

describe('parseDate', () => {
  test('yyyy-mm-dd', () => {
    expect(parseDate('2021-09-08')).toEqual([2021, 9, 8])
  })
  test('yyyy-m-d', () => {
    expect(parseDate('2021-9-8')).toEqual([2021, 9, 8])
  })
  test('mm-dd-yyyy', () => {
    expect(parseDate('09/08/2021')).toEqual([2021, 9, 8])
  })
  test('UK format regarded as invalid', () => {
    expect(() => parseDate('13/08/2021')).toThrow()
  })
  test('trim', () => {
    expect(parseDate('  2021-09-08  ')).toEqual([2021, 9, 8])
  })
  test('invalid1', () => {
    expect(() => parseDate('13/13/2021')).toThrow()
  })
  test('invalid2', () => {
    expect(() => parseDate('1b/13/2021')).toThrow()
  })
  test('invalid3', () => {
    expect(() => parseDate('20/12/12')).toThrow()
  })
})
