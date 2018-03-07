import React from 'react'

import { Button } from '@pubsweet/ui'
import { Item, Header, Body, Divider } from '../molecules/Item'
import { Links, LinkContainer } from '../molecules/Links'

import Status from '../Status'
import ProjectLink from '../ProjectLink'
import VersionTitle from './VersionTitle'

const OwnerItem = ({ project, version, deleteProject }) => (
  <Item>
    <Header>
      <Status status={project.status} />
    </Header>

    <Body>
      <VersionTitle version={version} />

      <Links>
        <LinkContainer>
          <ProjectLink page="submit" project={project} version={version}>
            Summary info
          </ProjectLink>
        </LinkContainer>

        <Divider separator="|" />

        <LinkContainer>
          <ProjectLink page="manuscript" project={project} version={version}>
            Manuscript
          </ProjectLink>
        </LinkContainer>

        <Divider separator="|" />

        <LinkContainer>
          <Button onClick={() => deleteProject(project)} plain>
            Delete
          </Button>
        </LinkContainer>
      </Links>
    </Body>
  </Item>
)

export default OwnerItem
