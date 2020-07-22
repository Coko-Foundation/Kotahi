import React from 'react'
import { useQuery, useMutation, ApolloConsumer } from '@apollo/client'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'

import config from 'config'
import { Container, Content, Section, Heading, UploadContainer, PageHeading } from '../style'
import UploadManuscript from './UploadManuscript'
import { Spinner } from '../../../shared'
import { Action } from '@pubsweet/ui'
import useCurrentUser from '../../../../hooks/useCurrentUser'
const { acceptUploadFiles } = config['pubsweet-component-xpub-dashboard'] || {}

const acceptFiles =
  acceptUploadFiles.length > 0
    ? acceptUploadFiles.join()
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'


const Dashboard = props => {
  const currentUser = useCurrentUser()

  return (
    <Container>
      <PageHeading level={1}>New submission</PageHeading>
      <Content>
      <UploadContainer>
        <ApolloConsumer>
          {client => (
            <UploadManuscript
              acceptFiles={acceptFiles}
              client={client}
              currentUser={currentUser}
              history={props.history}
            />
          )}
        </ApolloConsumer>
      </UploadContainer>

      </Content>
    </Container>
  )
}
export default Dashboard
