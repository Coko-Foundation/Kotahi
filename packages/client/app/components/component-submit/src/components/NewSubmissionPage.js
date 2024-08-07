import React from 'react'
import PropTypes from 'prop-types'
import { ApolloConsumer } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { Container, Content, UploadContainer, Heading } from '../style'
import UploadManuscript from './UploadManuscript'

const acceptUploadFiles = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-latex',
  'text/vnd.latex-z',
  'text/plain',
  'text/x-tex',
  'application/x-tex',
  'application/x-dvi',
  'application/pdf',
  'application/epub+zip',
  'application/zip',
  '.tex',
]

const acceptFiles =
  acceptUploadFiles.length > 0
    ? acceptUploadFiles.join()
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const Dashboard = ({ currentUser, history }) => {
  const { t } = useTranslation()
  return (
    <Container>
      <Heading>{t('newSubmission.New submission')}</Heading>
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
