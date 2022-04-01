import React from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Button } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'

import config from 'config'
import ReactRouterPropTypes from 'react-router-prop-types'
import getQueryStringByName from '../../../../shared/getQueryStringByName'
import queries from '../graphql/queries'
import mutations from '../graphql/mutations'
import { Container, Placeholder } from '../style'
import EditorItem from './sections/EditorItem'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'
import {
  Spinner,
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
  Heading,
  HeadingWithAction,
  CommsErrorBanner,
} from '../../../shared'

console.warn('tell me a thing')

const articleToApprove = getQueryStringByName('articleToApprove')

const teamFields = `
  id
  name
  role
  manuscript {
    ${articleToApprove}
  }
  members {
    id
    user {
      id
      username
    }
  }
`

// eslint-disable-next-line no-console
console.log('about to create team mutation')
// eslint-disable-next-line no-console
console.log(`all about ${teamFields}`)

const createTeamMutation = gql`
    mutation($input: TeamInput!) {
      createTeam(input: $input) {
        ${teamFields}
      }
    }
  `

const updateTeamMemberByManuscriptIdMutation = gql`
  mutation($id: ID!, $input: String) {
    updateTeamMemberByManuscriptId(id: $id, input: $input) {
      id
      user {
        id
        username
        profilePicture
        online
      }
      status
      isShared
    }
  }
`

const getLatestVersion = manuscript => {
  if (
    !manuscript ||
    !manuscript.manuscriptVersions ||
    manuscript.manuscriptVersions.length <= 0
  )
    return manuscript

  return manuscript.manuscriptVersions[0]
}

/** Filter to return those manuscripts with the given user in one of the given roles.
 * Roles is an array of role-name strings.
 */
const getManuscriptsUserHasRoleIn = (manuscripts, userId, roles) =>
  manuscripts.filter(m =>
    m.teams.some(
      t =>
        roles.includes(t.role) &&
        t.members.some(member => member.user.id === userId),
    ),
  )

const getRoles = (m, userId) =>
  m.teams
    .filter(t => t.members.some(member => member.user.id === userId))
    .map(t => t.role)

const Dashboard = ({ history, ...props }) => {
  const { loading, data, error } = useQuery(queries.dashboard, {
    fetchPolicy: 'cache-and-network',
  })

  // eslint-disable-next-line no-console
  console.log('about to hook mutations')

  const [createTeam] = useMutation(createTeamMutation)

  const [updateTeamMemberByManuscriptId] = useMutation(
    updateTeamMemberByManuscriptIdMutation,
  )

  if (articleToApprove) {
    // eslint-disable-next-line no-console
    console.log(`about to approve article ${articleToApprove}`)

    createTeam()
    updateTeamMemberByManuscriptId()

    /* TODO
    make sure there is a team of 'authors' in the teams table with the relevant manuscript_id
    create team if it doesn't exist team('author', manuscript_id, )
    add a row in the team_members table signifying that this user_id is in the team just mentioned
    updates the invitations table to 'approved', and update the user_id to the logged in user */
  }

  const [reviewerRespond] = useMutation(mutations.reviewerResponseMutation)

  // const [deleteManuscript] = useMutation(mutations.deleteManuscriptMutation, {
  //   update: (cache, { data: { deleteManuscript } }) => {
  //     const data = cache.readQuery({ query: queries.dashboard })
  //     const manuscripts = data.manuscripts.filter(
  //       manuscript => manuscript.id !== deleteManuscript,
  //     )
  //     cache.writeQuery({
  //       query: queries.dashboard,
  //       data: {
  //         manuscripts,
  //       },
  //     })
  //   },
  // })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />
  const currentUser = data && data.currentUser

  const latestVersions = data.manuscriptsUserHasCurrentRoleIn.map(
    getLatestVersion,
  )

  const authorLatestVersions = getManuscriptsUserHasRoleIn(
    latestVersions,
    currentUser.id,
    ['author'],
  )

  const reviewerLatestVersions = getManuscriptsUserHasRoleIn(
    latestVersions,
    currentUser.id,
    ['reviewer', 'invited:reviewer', 'accepted:reviewer', 'completed:reviewer'],
  )

  const editorLatestVersions = getManuscriptsUserHasRoleIn(
    latestVersions,
    currentUser.id,
    ['seniorEditor', 'handlingEditor', 'editor'],
  )

  // Editors are always linked to the parent/original manuscript, not to versions

  const urlFrag = config.journal.metadata.toplevel_urlfragment

  console.warn('tell me all the things')

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Dashboard</Heading>
        <Button
          onClick={() => history.push(`${urlFrag}/newSubmission`)}
          primary
        >
          ＋ New submission
        </Button>
      </HeadingWithAction>
      {!['ncrc'].includes(process.env.INSTANCE_NAME) && (
        <SectionContent>
          <SectionHeader>
            <Title>My Submissions</Title>
          </SectionHeader>
          {authorLatestVersions.length > 0 ? (
            authorLatestVersions.map(version => (
              // Links are based on the original/parent manuscript version
              <OwnerItem
                key={version.id}
                // deleteManuscript={() =>
                //   // eslint-disable-next-line no-alert
                //   window.confirm(
                //     'Are you sure you want to delete this submission?',
                //   ) && deleteManuscript({ variables: { id: submission.id } })
                // }
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
      {!['ncrc'].includes(process.env.INSTANCE_NAME) && (
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

Dashboard.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
}

export default Dashboard
