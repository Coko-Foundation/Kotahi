import React from 'react'
import { Button } from '@pubsweet/ui'
import { Container, Placeholder } from '../style'
import EditorItem from './sections/EditorItem'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'
import {
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
  Heading,
  HeadingWithAction,
} from '../../../shared'

const getRoles = (m, userId) =>
  m.teams
    .filter(t => t.members.some(member => member.user.id === userId))
    .map(t => t.role)

const Dashboard = ({
  newSubmission,
  instanceName,
  authorLatestVersions,
  reviewerLatestVersions,
  currentUser,
  reviewerRespond,
  editorLatestVersions,
  urlFrag,
  shouldShowShortId,
  prettyRoleText,
  createNewTaskAlerts, // For testing only. Pass in null to disable.
}) => {
  return (
    <Container>
      <HeadingWithAction>
        <Heading>Dashboard</Heading>
        <Button onClick={newSubmission} primary>
          ＋ New submission
        </Button>
        {createNewTaskAlerts && (
          <Button onClick={createNewTaskAlerts}>New Alerts</Button>
        )}
      </HeadingWithAction>
      {!['ncrc'].includes(instanceName) && (
        <SectionContent>
          <SectionHeader>
            <Title>My Submissions</Title>
          </SectionHeader>
          {authorLatestVersions.length > 0 ? (
            authorLatestVersions.map(version => (
              // Links are based on the original/parent manuscript version
              <OwnerItem
                instanceName={instanceName}
                // deleteManuscript={() =>
                //   // eslint-disable-next-line no-alert
                //   window.confirm(
                //     'Are you sure you want to delete this submission?',
                //   ) && deleteManuscript({ variables: { id: submission.id } })
                // }
                key={version.id}
                shouldShowShortId={shouldShowShortId}
                urlFrag={urlFrag}
                version={version}
              />
            ))
          ) : (
            <Placeholder>
              You have not submitted any manuscripts yet
            </Placeholder>
          )}
        </SectionContent>
      )}
      {!['ncrc'].includes(instanceName) && (
        <SectionContent>
          <SectionHeader>
            <Title>To Review</Title>
          </SectionHeader>
          {reviewerLatestVersions.length > 0 ? (
            reviewerLatestVersions.map(version => (
              <ReviewerItem
                currentUser={currentUser}
                key={version.id}
                reviewerRespond={reviewerRespond}
                urlFrag={urlFrag}
                version={version}
              />
            ))
          ) : (
            <Placeholder>
              You have not been assigned any reviews yet
            </Placeholder>
          )}
        </SectionContent>
      )}

      <SectionContent>
        <SectionHeader>
          <Title>Manuscripts I&apos;m editor of</Title>
        </SectionHeader>
        {editorLatestVersions.length > 0 ? (
          editorLatestVersions.map(manuscript => (
            <SectionRow key={`manuscript-${manuscript.id}`}>
              <EditorItem
                currentRoles={getRoles(manuscript, currentUser.id)}
                instanceName={instanceName}
                prettyRoleText={prettyRoleText}
                shouldShowShortId={shouldShowShortId}
                urlFrag={urlFrag}
                version={manuscript}
              />
            </SectionRow>
          ))
        ) : (
          <SectionRow>
            <Placeholder>
              You are not an editor of any manuscript yet
            </Placeholder>
          </SectionRow>
        )}
      </SectionContent>
    </Container>
  )
}

export default Dashboard
