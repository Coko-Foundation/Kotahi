import React from 'react'

import 'pubsweet-fira'
import 'typeface-fira-sans-condensed'
import 'typeface-vollkorn'

import '../app/styles/main.scss'

import { storiesOf, addDecorator } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import projects from './data/projects'
import versions from './data/versions'

import DeclarationAnswers from '../app/components/DeclarationAnswers'
import DeclarationQuestions from '../app/components/DeclarationQuestions'
import Project from '../app/components/Project'
import ProjectActions from '../app/components/ProjectActions'
import ProjectList from '../app/components/ProjectList'
import RolesSummaryItem from '../app/components/RolesSummaryItem'
import VersionsList from '../app/components/VersionsList'
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
import { Button } from 'react-bootstrap'

addDecorator(story => (
  <div style={{margin: 10}}>{story()}</div>
))

storiesOf('Welcome', module)
  .add('to xpub', () => (
    <div>
      <p>xpub is a journal publishing system that handles submission and peer review.</p>

      <ul>
        {/* <li>
          <Button bsStyle="link" onClick={linkTo('Login')}>sign in</Button>
        </li> */}
        <li>
          <Button bsStyle="link" onClick={linkTo('Upload Manuscript')}>upload a DOCX manuscript file</Button>
        </li>
      </ul>
    </div>
  ))

const currentUser = {
  id: 'foo',
  username: 'foo'
}

storiesOf('Styles', module)
  .add('colors', () => <Colors/>)
  .add('fonts', () => <Fonts/>)

storiesOf('Declarations', module)
  .add('questions', () => (
    <div>
      <p>The owner must complete all the declarations before they can submit.</p>

      <DeclarationQuestions declarations={projects.submitted.declarations} save={action('saved')}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Declarations', 'answers')}>view declaration answers</Button>
        </li>
      </ul>
    </div>
  ))
  .add('answers', () => (
    <div>
      <p>The declaration answers are displayed.</p>

      <p>Staff must check the submission before it can proceed.</p>

      <DeclarationAnswers declarations={projects.submitted.declarations}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Editors', 'form')}>assign an editor</Button>
        </li>
      </ul>
    </div>
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
    <div>
      <p>Staff pick one of the journal's editors to manage this submission.</p>

      <p>If enough is known about the editors and the submission, it may be possible to make recommendations.</p>

      <p>The editor must not have any conflicts of interest.</p>

      <EditorForm project={projects.submitted} updateCollection={action('update editors')}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Versions')}>view list of versions</Button>
        </li>
      </ul>
    </div>
  ))
  .add('list', () => (
    <EditorList project={projects.submitted} roles={projects.submitted.roles.editor}/>
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
    <div>
      <p>At first, the project only has a title.</p>

      <Project project={projects.imported}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Project Actions')}>view project actions</Button>
        </li>
      </ul>
    </div>
  ))

storiesOf('Project Actions', module)
  .add('for an imported project', () => (
    <div>
      <p>When a project is first imported, the owner can edit the converted manuscript.</p>

      <p>Once the owner is satisfied with the content, they can submit the manuscript for publication, either with or without peer review.</p>

      <p>In order to do so, they must complete the declarations.</p>

      <ProjectActions project={projects.imported}/>

      <ul>
        {/* <li>
          <Button bsStyle="link" onClick={linkTo('ArticleEditor')}>edit manuscript</Button>
        </li> */}
        <li>
          <Button bsStyle="link" onClick={linkTo('Declarations', 'questions')}>edit declarations</Button>
        </li>
      </ul>
    </div>
  ))
  .add('for a submitted project', () => (
    <div>
      <p>Once a project has been submitted for peer review, staff will check the submission.</p>

      <p>Once the submission has passed checks, staff will assign an editor, who will then assign reviewers.</p>

      <p>For each revision round, the editor will invite some, all or none of the reviewers to submit a review.</p>

      <p>Each reviewer can accept or decline their invitation. If they accept, they are given a deadline within which they should submit their review.</p>

      <ProjectActions project={projects.submitted}/>
    </div>
  ))

storiesOf('Project List', module)
  .add('items', () => (
    <div>
      <p>This is a list of projects, which should be filtered by visibility to the current user.</p>

      <ProjectList projects={Object.values(projects)}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Project')}>view a project</Button>
        </li>
      </ul>
    </div>
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

storiesOf('VersionsList', module)
  .add('for an imported project', () => (
    <VersionsList project={projects.imported} versions={versions}/>
  ))
  .add('for a submitted project', () => (
    <VersionsList project={projects.imported} versions={versions}/>
  ))

storiesOf('Upload Manuscript', module)
  .add('dropzone', () => (
    <div>
      <p>This is a dropzone: it receives a dragged file or can be clicked to open the system file picker.</p>

      <p>At this point only a single file is uploaded, enforcing the rule that the manuscript must be a single Word DOCX file including metadata, figures and tables.</p>

      <UploadManuscript onDrop={action('drop')} ink={{ isFetching: false }}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Upload Manuscript', 'converting')}>convert manuscript</Button>
        </li>
      </ul>
    </div>
  ))
  .add('converting', () => (
    <div>
      <p>The manuscript DOCX file is passed to an INK service, which converts it to HTML.</p>

      <p>The new project is then created.</p>

      <UploadManuscript onDrop={action('drop')} ink={{ isFetching: true }}/>

      <ul>
        <li>
          <Button bsStyle="link" onClick={linkTo('Project List')}>view created projects</Button>
        </li>
      </ul>
    </div>
  ))
