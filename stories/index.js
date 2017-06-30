import React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import Upload from '../app/components/Upload'

// storiesOf('Welcome', module)
//   .add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

storiesOf('Upload', module)
  .add('dropzone', () => (
    <Upload onDrop={action('dropped')} ink={{ isFetching: false }}/>
  ))
  .add('converting', () => (
    <Upload onDrop={action('dropped')} ink={{ isFetching: true }}/>
  ))

