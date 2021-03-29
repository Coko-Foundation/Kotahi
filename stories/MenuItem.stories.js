import React from 'react'
import { ThemeProvider } from 'styled-components'
import theme from '../app/theme'
import { Item } from '../app/components/Menu'

export const Base = args => <Item {...args} />
export const Active = Base.bind()
export const User = Base.bind()
export const Users = Base.bind()
export const CheckSquare = Base.bind()

Base.args = {
  active: false,
  link: '#',
  name: 'Menu item',
  icon: 'home',
}
Active.args = { ...Base.args, active: true }
User.args = { ...Base.args, icon: 'user' }
Users.args = { ...Base.args, icon: 'users' }
CheckSquare.args = { ...Base.args, icon: 'check-square' }

export default {
  title: 'Menu/Item',
  component: Item,
  argTypes: {
    active: { control: { type: 'boolean' } },
    link: { control: { type: 'text' } },
    name: { control: { type: 'text' } },
    icon: { control: { type: 'text' } },
  },
  decorators: [
    Story => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}
