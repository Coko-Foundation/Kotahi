import React from 'react'

import { Item, Header, Body, Divider } from '../molecules/Item'
import { Links, LinkContainer } from '../molecules/Links'
import { Roles, Role } from '../molecules/Roles'

import Status from '../Status'
import Meta from '../metadata/Meta'
import MetadataSections from '../metadata/MetadataSections'
import MetadataType from '../metadata/MetadataType'
import MetadataReviewType from '../metadata/MetadataReviewType'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataOwners from '../metadata/MetadataOwners'
import ProjectLink from '../ProjectLink'
import Reviews from '../Reviews'
import VersionTitle from './VersionTitle'

const EditorItemLinks = ({ project, version }) => (
  <Links>
    <LinkContainer>
      {/* {(!version.decision ||
        version.decision.status !== 'revising' ||
        version.decision.status !== 'submitted') && (
        <span>
          <ProjectLink page="reviewers" project={project} version={version}>
            Assign Reviewers
          </ProjectLink>

          <Divider separator="|" />
        </span>
      )} */}

      <ProjectLink
        id={project.id}
        page="decisions"
        project={project}
        version={version}
      >
        {version.decision && version.decision.status === 'submitted'
          ? `Decision: ${version.decision.recommendation}`
          : 'Control Panel'}
      </ProjectLink>
    </LinkContainer>
  </Links>
)

const EditorItem = ({ AssignEditor, project, version, addUserToTeam }) => (
  <Item>
    <Header>
      <Status status={project.status} />

      <Meta>
        <MetadataOwners owners={project.owners} />
        <Divider separator="–" />
        <MetadataSubmittedDate submitted={version.submitted} />
        <Divider separator="–" />
        <MetadataType type={version.metadata.articleType} />
        <Divider separator="–" />
        <MetadataSections sections={version.metadata.articleSection} />
        <Divider separator="–" />
        <MetadataReviewType
          openPeerReview={version.declarations.openPeerReview}
        />
      </Meta>
    </Header>

    <Body>
      <VersionTitle version={version} />
      <EditorItemLinks project={project} version={version} />
    </Body>

    <Roles>
      <Role>
        <AssignEditor
          addUserToTeam={addUserToTeam}
          project={project}
          teamTypeName="seniorEditor"
        />
      </Role>

      <Role>
        <AssignEditor
          addUserToTeam={addUserToTeam}
          project={project}
          teamTypeName="handlingEditor"
        />
      </Role>
    </Roles>

    <Reviews project={project} version={version} />
  </Item>
)

export default EditorItem
