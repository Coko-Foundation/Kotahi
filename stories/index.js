import React from 'react'

import 'pubsweet-fira'
import 'typeface-fira-sans-condensed'
import 'typeface-vollkorn'

import '../app/styles/main.scss'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import projects from './data/projects'

import Upload from '../app/components/Upload'
// import ProjectList from '../app/components/ProjectList'
import ProjectListItem from '../app/components/ProjectListItem'

// storiesOf('Welcome', module)
//   .add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

storiesOf('Upload', module)
  .add('dropzone', () => (
    <Upload onDrop={action('dropped')} ink={{ isFetching: false }}/>
  ))
  .add('converting', () => (
    <Upload onDrop={action('dropped')} ink={{ isFetching: true }}/>
  ))

storiesOf('ProjectListItem', module)
  .add('item', () => (
    <ProjectListItem project={projects[0]}/>
  ))

// storiesOf('ProjectList', module)
//   .add('empty', () => (
//     <ProjectList projects={[]}/>
//   ))
//   .add('full', () => (
//     <ProjectList projects={projects}/>
//   ))

