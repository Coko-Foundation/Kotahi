import React from 'react'
import DashboardLayout from '../../app/components/component-dashboard/src/components/DashboardLayout'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import * as journal from '../../config/journal'
import DesignEmbed from '../common/utils'

const urlFrag = '/kotahi'

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <>
        {args.figmaEmbedLink && (
          <>
            <h2 style={{ color: '#333333' }}>Design</h2>
            <iframe
              allowFullScreen
              height={350}
              src={args.figmaEmbedLink}
              style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              title="figma embed"
              width="100%"
            />
            <h2 style={{ color: '#333333' }}>Component</h2>
          </>
        )}
        <DashboardLayout
          createNewTaskAlerts={null}
          urlFrag={urlFrag}
          {...args}
        />
      </>
    </JournalProvider>
  </XpubProvider>
)

export default {
  title: 'Dashboard/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A2" />
      ),
    },
  },
  argTypes: {},
}
