import React from 'react'
import Collapse from '../../app/components/shared/Collapse'
import DesignEmbed from '../common/utils'

export const Base = args => (
  <Collapse defaultWidth={300}>
    <p>hello</p>
  </Collapse>
)

export default {
  title: 'Shared/CollapseWrapper',
  component: Collapse,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A28" />
      ),
    },
  },
}
