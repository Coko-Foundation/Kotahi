import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import Suggestions from './Suggestions'

Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({ 'pubsweet-client': {} }))

const suggestionsObject = {
  suggestions: {
    editors: {
      opposed: 'editor, opposed',
      suggested: 'editor, suggested',
    },
    reviewers: {
      opposed: 'reviewer, opposed',
      suggested: 'reviewer, suggested',
    },
  },
  readonly: true,
}

const getSuggested = object => object.children('div').first().text()

const getOpposed = object => object.children('div').last().text()

const makeWrapper = (props = { readonly: true, suggestions: {} }) => {
  // eslint-disable-next-line prefer-object-spread
  const manuscript = Object.assign(
    {
      suggestions: {
        editors: {
          opposed: [],
          suggested: [],
        },
        reviewers: {
          opposed: [],
          suggested: [],
        },
      },
    },
    { suggestions: props.suggestions },
  )

  return mount(
    <Suggestions manuscript={manuscript} readonly={props.readonly} />,
  )
}

const suggestions = makeWrapper(
  Object.assign(suggestionsObject, { readonly: true }),
)

describe('Suggestions', () => {
  it('shows a non-editable form', () => {
    const formSection = suggestions.children()
    expect(formSection).toHaveLength(2)
  })

  it('shows none suggested, opposed editors', () => {
    const noneEditors = makeWrapper().find('div[id="suggestions.editors"]')
    expect(getSuggested(noneEditors)).toEqual('none')
    expect(getOpposed(noneEditors)).toEqual('none')
  })

  it('shows none suggested, opposed reviewers', () => {
    const noneReviewers = makeWrapper().find('div[id="suggestions.reviewers"]')
    expect(getSuggested(noneReviewers)).toEqual('none')
    expect(getOpposed(noneReviewers)).toEqual('none')
  })

  it('shows a comma seperated suggested, opposed reviewers', () => {
    const sectionReviewers = suggestions.find('div[id="suggestions.reviewers"]')
    expect(getSuggested(sectionReviewers)).toEqual('reviewer, suggested')

    expect(getOpposed(sectionReviewers)).toEqual('reviewer, opposed')
  })

  it('shows a comma seperated suggested, opposed editor', () => {
    const sectionEditors = suggestions.find('div[id="suggestions.editors"]')

    expect(getSuggested(sectionEditors)).toEqual('editor, suggested')

    expect(getOpposed(sectionEditors)).toEqual('editor, opposed')
  })
})
