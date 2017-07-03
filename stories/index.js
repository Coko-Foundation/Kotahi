import React from 'react'

import 'pubsweet-fira'
import 'typeface-fira-sans-condensed'
import 'typeface-vollkorn'

import '../app/styles/main.scss'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import projects from './data/projects'
import snapshots from './data/snapshots'

import DeclarationAnswers from '../app/components/DeclarationAnswers'
import DeclarationQuestions from '../app/components/DeclarationQuestions'
import Project from '../app/components/Project'
import ProjectActions from '../app/components/ProjectActions'
import ProjectList from '../app/components/ProjectList'
import RemoveProject from '../app/components/RemoveProject'
import RolesSummaryItem from '../app/components/RolesSummaryItem'
import Snapshots from '../app/components/Snapshots'
import Upload from '../app/components/Upload'
import EditorList from '../app/components/EditorList'
import EditorForm from '../app/components/EditorForm'

// storiesOf('Welcome', module)
//   .add('to Storybook', () => <Welcome showApp={linkTo('Button')} />)

const [importedProject, submittedProject] = projects

storiesOf('Declarations', module)
  .add('questions', () => (
    <DeclarationQuestions declarations={submittedProject.declarations} save={action('saved')}/>
  ))
  .add('answers', () => (
    <DeclarationAnswers declarations={submittedProject.declarations}/>
  ))

storiesOf('Editors', module)
  .add('form', () => (
    <EditorForm project={submittedProject} updateCollection={action('update collection')}/>
  ))
  .add('list', () => (
    <EditorList project={submittedProject} roles={submittedProject.roles.editor}/>
  ))

storiesOf('Project', module)
  .add('title', () => (
    <Project project={importedProject}/>
  ))

storiesOf('Project Actions', module)
  .add('for an imported project', () => (
    <ProjectActions project={importedProject}/>
  ))
  .add('for a submitted project', () => (
    <ProjectActions project={submittedProject}/>
  ))

storiesOf('Project List', module)
  .add('items', () => (
    <ProjectList projects={projects}/>
  ))

storiesOf('Remove Project', module)
  .add('button', () => (
    <RemoveProject onClick={action('remove')}/>
  ))

storiesOf('Roles Summary Item', module)
  .add('item', () => (
    <RolesSummaryItem label="Owner" url="#" user={{
      username: 'foo'
    }}/>
  ))

storiesOf('Snapshots', module)
  .add('for an imported project', () => (
    <Snapshots project={importedProject} snapshots={snapshots}/>
  ))
  .add('for a submitted project', () => (
    <Snapshots project={importedProject} snapshots={snapshots}/>
  ))

storiesOf('Upload', module)
  .add('dropzone', () => (
    <Upload onDrop={action('drop')} ink={{ isFetching: false }}/>
  ))
  .add('converting', () => (
    <Upload onDrop={action('drop')} ink={{ isFetching: true }}/>
  ))
