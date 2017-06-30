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
import ProjectList from '../app/components/ProjectList'
import Project from '../app/components/Project'
import RemoveProject from '../app/components/RemoveProject'
import RolesSummaryItem from '../app/components/RolesSummaryItem'

// storiesOf('Welcome', module)
//   .add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

const project = projects[0]

storiesOf('Upload', module)
  .add('dropzone', () => (
    <Upload onDrop={action('drop')} ink={{ isFetching: false }}/>
  ))
  .add('converting', () => (
    <Upload onDrop={action('drop')} ink={{ isFetching: true }}/>
  ))

storiesOf('ProjectList', module)
  .add('items', () => (
    <ProjectList projects={projects}/>
  ))

storiesOf('Project', module)
  .add('title', () => (
    <Project project={project}/>
  ))

storiesOf('RemoveProject', module)
  .add('button', () => (
    <RemoveProject onClick={action('remove')}/>
  ))

storiesOf('RolesSummaryItem', module)
  .add('item', () => (
    <RolesSummaryItem label="Owner" url="#" user={{
      username: 'foo'
    }}/>
  ))
