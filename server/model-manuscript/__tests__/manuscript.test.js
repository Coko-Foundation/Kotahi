const { stripSensitiveItems } = require('../src/manuscriptUtils')

const ms = {
  id: 'version1',
  reviews: [
    { id: 'reviewA', confidentialComment: 'asdf' },
    { id: 'reviewB', confidentialComment: 'sdfg' },
  ],
  manuscriptVersions: [
    {
      id: 'version2',
      reviews: [
        { id: 'reviewC', confidentialComment: 'dfgh' },
        { id: 'reviewD', confidentialComment: 'fghj' },
      ],
    },
    {
      id: 'version3',
      reviews: [
        { id: 'reviewE', confidentialComment: 'qwer' },
        { id: 'reviewF', confidentialComment: 'wert' },
      ],
    },
  ],
}

const msStrippedOfConfidentialItems = {
  id: 'version1',
  reviews: [{ id: 'reviewA' }, { id: 'reviewB' }],
  manuscriptVersions: [
    {
      id: 'version2',
      reviews: [{ id: 'reviewC' }, { id: 'reviewD' }],
    },
    {
      id: 'version3',
      reviews: [{ id: 'reviewE' }, { id: 'reviewF' }],
    },
  ],
}

describe('stripSensitiveItems', () => {
  test('strip', () => {
    expect(stripSensitiveItems(ms)).toEqual(msStrippedOfConfidentialItems)
  })
})
