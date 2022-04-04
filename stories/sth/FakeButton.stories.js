import React from 'react'
import DesignEmbed from '../common/utils'

import Button from './FakeButton'

export const Base = args => <Button {...args} />

Base.args = {
  label: 'Click me',
  primary: false,
}

export const Primary = () => (
  <>
    <h2 style={{ color: '#333333' }}>Design</h2>
    <iframe
      allowFullScreen
      height={350}
      src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A83"
      style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
      title="figma embed"
      width="100%"
    />
    <h2 style={{ color: '#333333' }}>Component</h2>
    <Button label="Primary" primary />
  </>
)
export const NonPrimary = () => (
  <>
    <h2 style={{ color: '#333333' }}>Design</h2>
    <iframe
      allowFullScreen
      height={350}
      src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A85"
      style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
      title="figma embed"
      width={800}
    />
    <h2 style={{ color: '#333333' }}>Component</h2>
    <Button label="Not primary" />
  </>
)

export default {
  title: 'Fake Section/Button',
  component: Button,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A80" />
      ),
    },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    primary: { control: { type: 'boolean' } },
  },
}
