import { describe, it, expect } from 'vitest'

import validateApiToken from '../validateApiToken'

describe('validateApiToken', () => {
  it('nonePermitted', () => {
    expect(() => validateApiToken('aaa', '')).toThrow()
  })

  it('noToken', () => {
    expect(() => validateApiToken(null, 'aaa,bbb,ccc')).toThrow()
  })

  it('singleToken', () => {
    expect(() => validateApiToken('aaa', 'aaa')).not.toThrow()
  })

  it('severalTokens', () => {
    expect(() => validateApiToken('aaa', 'aaa,bbb,ccc')).not.toThrow()
  })

  it('severalTokens2', () => {
    expect(() => validateApiToken('bbb', 'aaa,bbb,ccc')).not.toThrow()
  })

  it('whitespace', () => {
    expect(() => validateApiToken('bbb', ' aaa ,  bbb  ,  ccc  ')).not.toThrow()
  })

  it('multiWordToken', () => {
    expect(() =>
      validateApiToken(
        'Ben: bbb',
        ' Alice: aaa ,  Ben: bbb  ,  Catherine: ccc  ',
      ),
    ).not.toThrow()
  })
})
