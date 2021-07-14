import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Button } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'

import config from 'config'
import ReactRouterPropTypes from 'react-router-prop-types'
import queries, {
  manuscriptImEditorOfQuery,
  manuscriptImAuthorOfQuery,
  manuscriptImReviewerOfQuery,
} from '../graphql/queries'
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
} from '../../../shared'

const latestVersion = manuscript =>
  manuscript.manuscriptVersions?.[0] || manuscript

const Dashboard = ({ history, ...props }) => {
  const {
    loading: loadingCurrentUser,
    data: dataCurrentUser,
    error: errorCurrentUser,
  } = useQuery(queries.dashboard)

  const {
    loading: loadingManuscriptImEditorOfQuery,
    data: dataManuscriptImEditorOfQuery,
    error: errorManuscriptImEditorOfQuery,
  } = useQuery(manuscriptImEditorOfQuery)

  const {
    loading: loadingManuscriptImAuthorOfQuery,
    data: dataManuscriptImAuthorOfQuery,
    error: errorManuscriptImAuthorOfQuery,
  } = useQuery(manuscriptImAuthorOfQuery)

  const {
    loading: loadingManuscriptImReviewerOfQuery,
    data: dataManuscriptImReviewerOfQuery,
    error: errorManuscriptImReviewerOfQuery,
  } = useQuery(manuscriptImReviewerOfQuery)

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

  if (
    loadingManuscriptImAuthorOfQuery ||
    loadingManuscriptImReviewerOfQuery ||
    loadingManuscriptImEditorOfQuery ||
    loadingCurrentUser
  )
    return <Spinner />
  if (
    errorManuscriptImAuthorOfQuery ||
    errorManuscriptImReviewerOfQuery ||
    errorManuscriptImEditorOfQuery ||
    errorCurrentUser
  )
    return JSON.stringify(
      errorManuscriptImAuthorOfQuery ||
        errorManuscriptImReviewerOfQuery ||
        errorManuscriptImEditorOfQuery ||
        errorCurrentUser,
    )
  const currentUser = dataCurrentUser && dataCurrentUser.currentUser

  // Editors are always linked to the parent/original manuscript, not to versions

  const urlFrag = config.journal.metadata.toplevel_urlfragment

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
          {dataManuscriptImAuthorOfQuery &&
          dataManuscriptImAuthorOfQuery.manuscriptsImAuthorOf.length > 0 ? (
            dataManuscriptImAuthorOfQuery.manuscriptsImAuthorOf
              .map(latestVersion)
              .map(submission => (
                // Links are based on the original/parent manuscript version
                <OwnerItem
                  key={submission.id}
                  // deleteManuscript={() =>
                  //   // eslint-disable-next-line no-alert
                  //   window.confirm(
                  //     'Are you sure you want to delete this submission?',
                  //   ) && deleteManuscript({ variables: { id: submission.id } })
                  // }
                  version={submission}
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
          {dataManuscriptImReviewerOfQuery &&
          dataManuscriptImReviewerOfQuery.manuscriptsImReviewerOf.length > 0 ? (
            dataManuscriptImReviewerOfQuery.manuscriptsImReviewerOf
              .map(latestVersion)
              .map(review => (
                <SectionRow key={review.id}>
                  <ReviewerItem
                    currentUser={currentUser}
                    key={review.id}
                    reviewerRespond={reviewerRespond}
                    version={review}
                  />
                </SectionRow>
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
        {dataManuscriptImEditorOfQuery &&
        dataManuscriptImEditorOfQuery.manuscriptImEditorOf.length > 0 ? (
          dataManuscriptImEditorOfQuery.manuscriptImEditorOf
            .map(latestVersion)
            .map(manuscript => (
              <SectionRow key={`manuscript-${manuscript.id}`}>
                <EditorItem version={manuscript} />
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
