import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { ApolloConsumer } from '@apollo/client'
import config from 'config'
import { useTranslation } from 'react-i18next'
import { Container, Content, UploadContainer, Heading } from '../style'
import UploadManuscript from './UploadManuscript'
import { ConfigContext } from '../../../config/src'

const { acceptUploadFiles } = config['pubsweet-component-xpub-dashboard'] || {}

const acceptFiles =
  acceptUploadFiles.length > 0
    ? acceptUploadFiles.join()
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const Dashboard = ({ currentUser, history }) => {
  const { t } = useTranslation()
  const configurationContext = useContext(ConfigContext)

  return (
    <Container>
      <Heading>
        {t(
          `newSubmission.New ${
            ['lab'].includes(configurationContext.instanceName)
              ? 'post'
              : 'submission'
          }`,
        )}
      </Heading>
      <Content>
        <UploadContainer>
          <ApolloConsumer>
            {client => (
              <UploadManuscript
                acceptFiles={acceptFiles}
                client={client}
                currentUser={currentUser}
                history={history}
              />
            )}
          </ApolloConsumer>
        </UploadContainer>
      </Content>
    </Container>
  )
}

Dashboard.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default Dashboard
