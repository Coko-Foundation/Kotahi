import React from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Action, Button, Icon } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'

import queries from '../graphql/queries/'
import mutations from '../graphql/mutations/'
import {
  Container,
  Section,
  Heading,
  Content,
  HeadingWithAction,
} from '../style'
import EditorItem from './sections/EditorItem'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'
import {
  Spinner,
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
} from '../../../shared'

const updateReviewer = (proxy, { data: { reviewerResponse } }) => {
  const id = reviewerResponse.object.objectId
  const data = proxy.readQuery({
    query: queries.dashboard,
    variables: {
      id,
    },
  })

  const manuscriptIndex = data.manuscripts.findIndex(manu => manu.id === id)
  const teamIndex = data.manuscripts[manuscriptIndex].teams.findIndex(
    team => team.id === reviewerResponse.id,
  )

  data.manuscripts[manuscriptIndex].teams[teamIndex] = reviewerResponse
  proxy.writeQuery({ query: queries.dashboard, data })
}

const Dashboard = ({ history, ...props }) => {
  // const uploadManuscript = upload()
  // const [conversion] = useContext(XpubContext)

  const { loading, data } = useQuery(queries.dashboard)
  const [reviewerRespond] = useMutation(mutations.reviewerResponseMutation, {
    // variables: { currentUserId, action, teamId },
    update: updateReviewer,
  })
  const [deleteManuscript] = useMutation(mutations.deleteManuscriptMutation, {
    // variables: { id: manuscript.id },
    update: (proxy, { data: { deleteManuscript } }) => {
      const data = proxy.readQuery({ query: queries.dashboard })
      const manuscriptIndex = data.manuscripts.findIndex(
        manuscript => manuscript.id === deleteManuscript,
      )
      if (manuscriptIndex > -1) {
        data.manuscripts.splice(manuscriptIndex, 1)
        proxy.writeQuery({ query: queries.dashboard, data })
      }
    },
  })

  if (loading) return <Spinner />

  const dashboard = (data && data.manuscripts) || []
  const currentUser = data && data.currentUser

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Dashboard</Heading>
        <Button onClick={() => history.push('/journal/newSubmission')} primary>
          {/* <Icon>plus</Icon> */}＋ New submission
        </Button>
      </HeadingWithAction>

      {!dashboard.length && <Section>Nothing to do at the moment.</Section>}
      {/* <Authorize object={dashboard} operation="can view my submission section"> */}
      {dashboard.length > 0 ? (
        <SectionContent>
          <SectionHeader>
            <Title>My Submissions</Title>
          </SectionHeader>
          {dashboard.map(submission => (
            <SectionRow key={`submission-${submission.id}`}>
              <OwnerItem
                deleteManuscript={() =>
                  // eslint-disable-next-line no-alert
                  window.confirm(
                    'Are you sure you want to delete this submission?',
                  ) && deleteManuscript({ variables: { id: submission.id } })
                }
                version={submission}
              />
            </SectionRow>
          ))}
        </SectionContent>
      ) : null}
      {/* </Authorize>
      <Authorize object={dashboard} operation="can view review section"> */}
      {dashboard.length > 0 ? (
        <SectionContent>
          <SectionHeader>
            <Title>To Review</Title>
          </SectionHeader>

          {dashboard.map(review => (
            <SectionRow key={review.id}>
              <ReviewerItem
                currentUser={currentUser}
                key={review.id}
                reviewerRespond={reviewerRespond}
                version={review}
              />
            </SectionRow>
          ))}
        </SectionContent>
      ) : null}
      {/* </Authorize> */}

      {/* <Authorize object={dashboard} operation="can view my manuscripts section"> */}
      {dashboard.length > 0 ? (
        <SectionContent>
          <SectionHeader>
            <Title>Manuscripts I'm editor of</Title>
          </SectionHeader>
          {dashboard.map(manuscript => (
            <SectionRow key={`manuscript-${manuscript.id}`}>
              <EditorItem version={manuscript} />
            </SectionRow>
          ))}
        </SectionContent>
      ) : null}
      {/* </Authorize> */}
    </Container>
  )
}
export default Dashboard
