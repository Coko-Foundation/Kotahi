import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import YesOrNo from '../src/molecules/YesOrNo'
import RadioGroup from '../src/molecules/RadioGroup'

const handleChange = () => { return null }

const props = {
  handleChange,
  name: 'TestName',
  value: 'Maybe'
}

const wrapper = shallow(<YesOrNo {...props} />)
const radio = wrapper.find(RadioGroup)

describe('Yes or No', () => {
  test('Snapshot', () => {
    const tree = renderer.create(
      <YesOrNo {...props} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Renders a RadioGroup', () => {
    expect(wrapper.is('RadioGroup')).toBeTruthy()
    expect(radio).toHaveLength(1)
  })

  test('Passes the correct options', () => {
    const options = radio.props().options
    expect(options).toHaveLength(2)

    expect(options[0].value).toEqual('yes')
    expect(options[0].label).toEqual('Yes')

    expect(options[1].value).toEqual('no')
    expect(options[1].label).toEqual('No')
  })

  test('Passes down the correct name', () => {
    const name = radio.props().name
    expect(name).toEqual(props.name)
  })

  test('Passes down the correct value', () => {
    const value = radio.props().value
    expect(value).toEqual(props.value)
  })

  test('Passes down the correct handle change function', () => {
    const handle = radio.props().handleChange
    expect(handle).toEqual(props.handleChange)
  })
})
