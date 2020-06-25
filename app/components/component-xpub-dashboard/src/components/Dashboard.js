import React from 'react'
import { useQuery, useMutation, ApolloConsumer } from '@apollo/react-hooks'
import Authorize from 'pubsweet-client/src/helpers/Authorize'

import config from 'config'
import queries from '../graphql/queries/'
import mutations from '../graphql/mutations/'
import { Page, Section, Heading, UploadContainer } from './molecules/Page'
import UploadManuscript from './UploadManuscript'
import EditorItem from './sections/EditorItem'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'

const { acceptUploadFiles } = config['pubsweet-component-xpub-dashboard'] || {}

const acceptFiles =
  acceptUploadFiles.length > 0
    ? acceptUploadFiles.join()
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

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

// export default compose(
//   withProps(({ journals, currentUser }) => ({
//     dashboard: (journals || {}).manuscripts || [],
//     journals,
//     currentUser,
//     acceptFiles,
//   })),
//   upload,
// )(Dashboard)

const Dashboard = ({
  // acceptFiles,
  // currentUser, // graphql
  // dashboard, // graphql
  // journals, // graphql
  // deleteManuscript, // graphql
  // reviewerResponse, // graphql
  // uploadManuscript, // from compose
  ...props
}) => {
  // const uploadManuscript = upload()

  // const [conversion] = useContext(XpubContext)

  const { loading, data } = useQuery(queries.dashboard)
  const dashboard = ((data && data.journals) || {}).manuscripts || []
  const journals = data && data.journals
  const currentUser = data && data.currentUser

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

  if (loading) return <div>Loading...</div>

  return (
    <Page>
      <UploadContainer>
        <ApolloConsumer>
          {client => (
            <UploadManuscript
              acceptFiles={acceptFiles}
              client={client}
              currentUser={currentUser}
              history={props.history}
              journals={journals}
            />
          )}
        </ApolloConsumer>
      </UploadContainer>

      {!dashboard.length && (
        <UploadContainer>Nothing to do at the moment.</UploadContainer>
      )}
      {/* <Authorize object={dashboard} operation="can view my submission section"> */}
      {dashboard.length > 0 ? (
        <Section>
          <Heading>My Submissions</Heading>
          {dashboard.map(submission => (
            <OwnerItem
              deleteManuscript={() =>
                // eslint-disable-next-line no-alert
                window.confirm(
                  'Are you sure you want to delete this submission?',
                ) && deleteManuscript({ variables: { id: submission.id } })
              }
              journals={journals}
              key={`submission-${submission.id}`}
              version={submission}
            />
          ))}
        </Section>
      ) : null}
      {/* </Authorize>
      <Authorize object={dashboard} operation="can view review section"> */}
      {dashboard.length > 0 ? (
        <Section>
          <Heading>To review</Heading>
          {dashboard.map(review => (
            <ReviewerItem
              currentUser={currentUser}
              journals={journals}
              key={review.id}
              reviewerRespond={reviewerRespond}
              version={review}
            />
          ))}
        </Section>
      ) : null}
      {/* </Authorize> */}

      {/* <Authorize object={dashboard} operation="can view my manuscripts section"> */}
      {dashboard.length > 0 ? (
        <Section>
          <Heading>My Manuscripts</Heading>
          {dashboard.map(manuscript => (
            <EditorItem
              journals={journals}
              key={`manuscript-${manuscript.id}`}
              version={manuscript}
            />
          ))}
        </Section>
      ) : null}
      {/* </Authorize> */}
    </Page>
  )
}
export default Dashboard
