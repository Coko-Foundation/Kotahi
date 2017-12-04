import React from 'react'
import { clone } from 'lodash'
import { shallow } from 'enzyme'
import { Link, MemoryRouter } from 'react-router-dom'
import renderer from 'react-test-renderer'

import AppBar from '../src/molecules/AppBar'

const props = {
  brandLink: 'some link',
  brandName: 'some brand',
  loginLink: 'login link',
  logoutLink: 'logout link',
  userName: 'some name',
}

function makeWrapper(extraProps = {}) {
  return shallow(
    <MemoryRouter>
      <AppBar {...props} {...extraProps} />
    </MemoryRouter>,
  )
    .dive()
    .dive()
}

describe('AppBar', () => {
  test('Snapshot', () => {
    const tree = renderer
      .create(
        <MemoryRouter>
          <AppBar {...props} />
        </MemoryRouter>,
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  test("Should link the brand to '/' if no brand link is given", () => {
    const wrapper = makeWrapper({ brandLink: undefined })

    const brand = wrapper.childAt(0)
    expect(brand.prop('to')).toBe('/')
  })

  test('Should link the brand to the given prop', () => {
    const wrapper = makeWrapper()
    const brand = wrapper.childAt(0)
    expect(brand.prop('to')).toBe(props.brandLink)
  })

  test('Should display the brand name', () => {
    const wrapper = makeWrapper()
    const brand = wrapper.childAt(0)
    const brandName = brand.childAt(0)

    expect(brandName.text()).toBe(props.brandName)
  })

  test('Should not display the username if there is none given', () => {
    const wrapper = makeWrapper({ userName: undefined })

    const rightArea = wrapper.childAt(1)

    // If the username does not display, there is only child (login / logout)
    expect(rightArea.children).toHaveLength(1)
  })

  test('Should display the username', () => {
    const wrapper = makeWrapper()
    const rightArea = wrapper.childAt(1)
    expect(rightArea.children()).toHaveLength(2)

    const userName = rightArea.childAt(0)
    expect(userName.text()).toBe('<Icon />some name')
  })

  test('Should display the login link if no username is given', () => {
    const wrapper = makeWrapper({ userName: undefined })

    const rightArea = wrapper.childAt(1)
    const logLink = rightArea.childAt(0) // first el if there is no username

    expect(logLink.is(Link)).toBeTruthy()
    expect(logLink.prop('to')).toBe(props.loginLink)
    expect(logLink.children()).toHaveLength(1)

    const logLinkText = logLink.childAt(0)
    expect(logLinkText.text()).toBe('login')
  })

  test('Should display the logout link if a username is found', () => {
    const wrapper = makeWrapper()
    const rightArea = wrapper.childAt(1)
    const logLink = rightArea.childAt(1) // 2nd el if there is a username

    expect(logLink.is(Link)).toBeTruthy()
    expect(logLink.prop('to')).toBe(props.logoutLink)
    expect(logLink.children()).toHaveLength(1)

    const logLinkText = logLink.childAt(0)
    expect(logLinkText.text()).toBe('logout')
  })
})
