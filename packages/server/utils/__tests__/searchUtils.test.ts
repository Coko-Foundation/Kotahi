import { describe, it, expect } from 'vitest'

import { formatSearchQueryForPostgres, segmentQuery } from '../searchUtils'

describe('segmentQuery', () => {
  it('blank', () => {
    expect(segmentQuery('')).toEqual([])
  })

  it('whitespace', () => {
    expect(segmentQuery('    ')).toEqual([])
  })

  it('single', () => {
    expect(segmentQuery('hello')).toEqual(['hello'])
  })

  it('hyphenated', () => {
    expect(segmentQuery('hi-ho')).toEqual(['hi-ho'])
  })

  it('and', () => {
    expect(segmentQuery('this that other')).toEqual(['this', 'that', 'other'])
  })

  it('phrase', () => {
    expect(segmentQuery('"a phrase"')).toEqual(['"', 'a', 'phrase', '"'])
  })

  it('phrase2', () => {
    expect(segmentQuery('" a phrase "')).toEqual(['"', 'a', 'phrase', '"'])
  })

  it('phrase3', () => {
    expect(segmentQuery('a word and "a phrase"')).toEqual([
      'a',
      'word',
      'and',
      '"',
      'a',
      'phrase',
      '"',
    ])
  })

  it('not', () => {
    expect(segmentQuery('-this')).toEqual(['-', 'this'])
  })

  it('not2', () => {
    expect(segmentQuery('- this')).toEqual(['-', 'this'])
  })

  it('not3', () => {
    expect(segmentQuery('that -this')).toEqual(['that', '-', 'this'])
  })

  it('or', () => {
    expect(segmentQuery('this OR that')).toEqual(['this', 'OR', 'that'])
  })

  it('parentheses', () => {
    expect(segmentQuery('bank -("river bank")')).toEqual([
      'bank',
      '-',
      '(',
      '"',
      'river',
      'bank',
      '"',
      ')',
    ])
  })

  it('parentheses2', () => {
    expect(segmentQuery('bank -((river OR road) bank)')).toEqual([
      'bank',
      '-',
      '(',
      '(',
      'river',
      'OR',
      'road',
      ')',
      'bank',
      ')',
    ])
  })

  it('extra space', () => {
    expect(segmentQuery('   this  that  (  other  )  ')).toEqual([
      'this',
      'that',
      '(',
      'other',
      ')',
    ])
  })
})

describe('formatSearchQueryForPostgres', () => {
  it('blank', () => {
    expect(formatSearchQueryForPostgres('')).toEqual('')
  })

  it('single', () => {
    expect(formatSearchQueryForPostgres('hello')).toEqual('hello')
  })

  it('hyphenated', () => {
    expect(formatSearchQueryForPostgres('hi-ho')).toEqual('hi-ho')
  })

  it('and', () => {
    expect(formatSearchQueryForPostgres('this that other')).toEqual(
      'this & that & other',
    )
  })

  it('phrase', () => {
    expect(formatSearchQueryForPostgres('"a phrase"')).toEqual('a <-> phrase')
  })

  it('phrase2', () => {
    expect(formatSearchQueryForPostgres('a word and "a phrase"')).toEqual(
      'a & word & and & a <-> phrase',
    )
  })

  it('phrase3', () => {
    expect(formatSearchQueryForPostgres('a word but -"a phrase"')).toEqual(
      'a & word & but & !( a <-> phrase )',
    )
  })

  it('not', () => {
    expect(formatSearchQueryForPostgres('-this')).toEqual('!this')
  })

  it('not2', () => {
    expect(formatSearchQueryForPostgres('that -this')).toEqual('that & !this')
  })

  it('or', () => {
    expect(formatSearchQueryForPostgres('this OR that')).toEqual('this | that')
  })

  it('parentheses', () => {
    expect(formatSearchQueryForPostgres('bank -("river bank")')).toEqual(
      'bank & !( river <-> bank )',
    )
  })

  it('parentheses2', () => {
    expect(
      formatSearchQueryForPostgres('bank -((river OR road) bank)'),
    ).toEqual('bank & !( ( river | road ) & bank )')
  })

  it('malformed1', () => {
    expect(formatSearchQueryForPostgres('a b)')).toEqual('a & b')
    expect(formatSearchQueryForPostgres(')a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a b(')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('(a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a (b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a) b')).toEqual('a & b')
  })

  it('malformed2', () => {
    expect(formatSearchQueryForPostgres('a b -')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a (-) b')).toEqual('a & b')
  })

  it('malformed3', () => {
    expect(formatSearchQueryForPostgres('a "" b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a b "')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('a " b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('"a b')).toEqual('a <-> b')
  })

  it('malformed4', () => {
    expect(formatSearchQueryForPostgres('a OR OR b')).toEqual('a | b')
    expect(formatSearchQueryForPostgres('a b OR')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('OR a b')).toEqual('a & b')
    expect(formatSearchQueryForPostgres('"a OR b"')).toEqual('a <-> OR <-> b')
  })

  it('escaping', () => {
    expect(
      formatSearchQueryForPostgres('https://doi.org/10.1101/2022.08.11.503644'),
    ).toEqual('https\\://doi.org/10.1101/2022.08.11.503644')
  })

  it('doi', () => {
    expect(
      formatSearchQueryForPostgres('doi.org/10.1101/2022.08.11.503644'),
    ).toEqual(
      'doi.org/10.1101/2022.08.11.503644 | /doi.org/10.1101/2022.08.11.503644',
    )
  })

  it('doi2', () => {
    expect(
      formatSearchQueryForPostgres(
        '"this doi.org/10.1101/2022.08.11.503644 in phrase"',
      ),
    ).toEqual(
      'this <-> ( doi.org/10.1101/2022.08.11.503644 | /doi.org/10.1101/2022.08.11.503644 ) <-> in <-> phrase',
    )
  })

  it('apostrophe', () => {
    expect(formatSearchQueryForPostgres(`apples aren't oranges`)).toEqual(
      'apples & aren <-> t & oranges',
    )
  })

  it('apostrophe2', () => {
    expect(formatSearchQueryForPostgres(`apples -aren't oranges`)).toEqual(
      'apples & !( aren <-> t ) & oranges',
    )
    expect(formatSearchQueryForPostgres(`"apples aren't oranges"`)).toEqual(
      'apples <-> aren <-> t <-> oranges',
    )
  })

  it('apostrophe3', () => {
    expect(formatSearchQueryForPostgres(`boys' toys`)).toEqual('boys & toys')
  })

  it('illegal chars', () => {
    expect(formatSearchQueryForPostgres('AT&T')).toEqual('AT <-> T')
    expect(formatSearchQueryForPostgres('"the AT&T company"')).toEqual(
      'the <-> AT <-> T <-> company',
    )
    expect(formatSearchQueryForPostgres('x|y AT&T back\\slash')).toEqual(
      'x <-> y & AT <-> T & back <-> slash',
    )
  })

  it('wildcard', () => {
    expect(formatSearchQueryForPostgres(`"univers* paper"`)).toEqual(
      'univers:* <-> paper',
    )
  })
})
