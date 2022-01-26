import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
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
  downloadPdf,
  // fileUpload,
  updateManuscript,
}) => {
  if (downloadPdf) {
    // TODO: question: does this need to be turned into a blob?
    window.open(downloadPdf)

    // use this code for downloading the PDF:

    const link = document.createElement('a')
    link.href = downloadPdf
    link.download = `${title || 'title'}.pdf`
    link.click()

    // console.log(`Downloading ${link.download}`)

    // For Firefox it is necessary to delay revoking the ObjectURL.

    setTimeout(() => {
      window.URL.revokeObjectURL(downloadPdf)
      makePdf(false)
    }, 1000)
  }

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Production</Heading>
        <DownloadDropdown
          makePdf={makePdf}
          metadata={manuscript}
          source={manuscript.meta.source}
        />
      </HeadingWithAction>
      {file &&
      file.mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
        <SectionContent>
          {manuscript ? (
            <ProductionWaxEditor
              onBlur={source => {
                updateManuscript(manuscript.id, { meta: { source } })
              }}
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
