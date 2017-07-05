import React from 'react'

import 'pubsweet-fira'
import 'typeface-fira-sans-condensed'
import 'typeface-vollkorn'

import '../app/styles/main.scss'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import projects from './data/projects'
import snapshots from './data/snapshots'

import DeclarationAnswers from '../app/components/DeclarationAnswers'
import DeclarationQuestions from '../app/components/DeclarationQuestions'
import Project from '../app/components/Project'
import ProjectActions from '../app/components/ProjectActions'
import ProjectList from '../app/components/ProjectList'
import RolesSummaryItem from '../app/components/RolesSummaryItem'
import Snapshots from '../app/components/Snapshots'
import UploadManuscript from '../app/components/UploadManuscript'
import EditorList from '../app/components/EditorList'
import EditorForm from '../app/components/EditorForm'
import ReviewersForm from '../app/components/ReviewersForm'
import ReviewersList from '../app/components/ReviewersList'
import ReviewerInvitationForm from '../app/components/ReviewerInvitationForm'
import DecisionForm from '../app/components/DecisionForm'
import ReviewForm from '../app/components/ReviewForm'
import Navigation from '../app/components/Navigation'

import Colors from './components/Colors'
import Fonts from './components/Fonts'

// storiesOf('Welcome', module)
//   .add('to xpub', () => (
//     <div>
//       <p>xpub is a journal publishing system that handles submission and peer review.</p>
//       <p>Firstly, an author will <a href={linkTo('Login')}>sign in</a> and <a href={linkTo('Upload Manuscript')}>upload a DOCX manuscript file</a>.</p>
//     </div>
//   ))

const currentUser = {
  id: 'foo',
  username: 'foo'
}

storiesOf('Styles', module)
  .add('colors', () => <Colors/>)
  .add('fonts', () => <Fonts/>)

storiesOf('Declarations', module)
  .add('questions', () => (
    <DeclarationQuestions declarations={projects.submitted.declarations}
                          save={action('saved')}/>
  ))
  .add('answers', () => (
    <DeclarationAnswers declarations={projects.submitted.declarations}/>
  ))

storiesOf('Decision Form', module)
  .add('unsent', () => (
    <DecisionForm onSubmit={action('submitted decision')}/>
  ))
  .add('sent', () => (
    <DecisionForm onSubmit={action('submitted decision')}/>
  ))

storiesOf('Editors', module)
  .add('form', () => (
    <EditorForm project={projects.submitted}
                updateCollection={action('update editors')}/>
  ))
  .add('list', () => (
    <EditorList project={projects.submitted}
                roles={projects.submitted.roles.editor}/>
  ))

storiesOf('Navigation', module)
  .add('anonymous', () => (
    <Navigation appName="xpub"
                appLink="/projects"
                logout={action('logout')}/>
  ))
  .add('authenticated', () => (
    <Navigation appName="xpub"
                appLink="/projects"
                logout={action('logout')}
                currentUser={currentUser}/>
  ))

storiesOf('Project', module)
  .add('title', () => (
    <Project project={projects.imported}/>
  ))

storiesOf('Project Actions', module)
  .add('for an imported project', () => (
    <ProjectActions project={projects.imported}/>
  ))
  .add('for a submitted project', () => (
    <ProjectActions project={projects.submitted}/>
  ))

storiesOf('Project List', module)
  .add('items', () => (
    <ProjectList projects={projects}/>
  ))

storiesOf('Reviewers', module)
  .add('form', () => (
    <ReviewersForm project={projects.submitted}
                   updateCollection={action('update reviewers')}/>
  ))
  .add('list', () => (
    <ReviewersList project={projects.submitted}
                   roles={projects.submitted.roles.reviewer}/>
  ))

storiesOf('Review Form', module)
  .add('new', () => (
    <ReviewForm
      role={projects.submitted.roles.reviewer['user-baz']}
      onSubmit={action('submitted review')}/>
  ))
  .add('submitted', () => (
    <ReviewForm
      role={projects.submitted.roles.reviewer['user-baz']}
      onSubmit={action('submitted review')}/>
  ))

storiesOf('Reviewer Invitation Form', module)
  .add('new', () => (
    <ReviewerInvitationForm
          role={projects.submitted.roles.reviewer['user-baz']}
          onSubmit={action('sent reviewer invitation')}/>
  ))
  .add('invited', () => (
    <ReviewerInvitationForm
      role={projects.submitted.roles.reviewer['user-baz']}
      onSubmit={action('sent reviewer invitation')}/>
  ))

storiesOf('Roles Summary Item', module)
  .add('item', () => (
    <RolesSummaryItem label="Owner" url="#" user={{
      username: 'foo'
    }}/>
  ))

storiesOf('Snapshots', module)
  .add('for an imported project', () => (
    <Snapshots project={projects.imported} snapshots={snapshots}/>
  ))
  .add('for a submitted project', () => (
    <Snapshots project={projects.imported} snapshots={snapshots}/>
  ))

storiesOf('Upload Manuscript', module)
  .add('dropzone', () => (
    <UploadManuscript onDrop={action('drop')} ink={{ isFetching: false }}/>
  ))
  .add('converting', () => (
    <UploadManuscript onDrop={action('drop')} ink={{ isFetching: true }}/>
  ))
