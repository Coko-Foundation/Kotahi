import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { debounce } from 'lodash'
import ProductionWaxEditor from '../../../wax-collab/src/ProductionWaxEditor'
import { DownloadDropdown } from './DownloadDropdown'
import {
  Container,
  Heading,
  HeadingWithAction,
  SectionContent,
  Spinner,
} from '../../../shared'

const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Production = ({
  file,
  manuscript,
  currentUser,
  makePdf,
  makeJats,
  updateManuscript,
}) => {
  const handleSave = debounce(source => {
    updateManuscript(manuscript.id, { meta: { source } })
  }, 2000)

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Production</Heading>
        <DownloadDropdown
          makeJats={makeJats}
          makePdf={makePdf}
          manuscriptId={manuscript.id}
          manuscriptSource={manuscript.meta.source}
        />
      </HeadingWithAction>
      {file &&
      file.storedObjects[0].mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
        <SectionContent>
          {manuscript ? (
            <ProductionWaxEditor
              // onBlur={source => {
              //   updateManuscript(manuscript.id, { meta: { source } })
              // }}
              saveSource={handleSave}
              user={currentUser}
              value={manuscript.meta.source}
            />
          ) : (
            <Spinner />
          )}
        </SectionContent>
      ) : (
        <SectionContent>
          <Info>No supported view of the file</Info>
        </SectionContent>
      )}
    </Container>
  )
}

export default withRouter(Production)
