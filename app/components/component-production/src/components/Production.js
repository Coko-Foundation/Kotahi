import React, { useCallback, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
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
import { Info } from './styles'

const Production = ({
  client,
  file,
  manuscript,
  currentUser,
  makePdf,
  makeJats,
  updateManuscript,
  onAssetManager,
}) => {
  const debouncedSave = useCallback(
    debounce(source => {
      updateManuscript(manuscript.id, { meta: { source } })
    }, 2000),
    [],
  )

  useEffect(() => debouncedSave.flush, [])

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
              client={client}
              manuscriptId={manuscript.id}
              onAssetManager={onAssetManager}
              saveSource={debouncedSave}
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
