import React from 'react'
import { Formik } from 'formik'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import * as journal from '../../config/journal'
import DesignEmbed from '../common/utils'
import ReviewForm from '../../app/components/component-review/src/components/review/ReviewForm'

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
        <Formik>
          <ReviewForm {...args} />
        </Formik>
      </>
    </JournalProvider>
  </XpubProvider>
)

const baseProps = {
  isValid: true,
  isSubmitting: false,
  manuscriptId: 'aef08123-c009-4cd1-b9e0-9dbac8c50528',
  handleSubmit: () => {},
  updateReview: () => {},
  createFile: () => {},
  deleteFile: () => {},
}

Base.args = baseProps

export default {
  title: 'Review/ReviewForm',
  component: ReviewForm,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1634%253A32" />
      ),
    },
  },
  argTypes: {},
}
