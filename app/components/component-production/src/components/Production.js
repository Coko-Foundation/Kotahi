import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import ProductionWaxEditor from '../../../wax-collab/src/ProductionWaxEditor'

import { Spinner } from '../../../shared'

const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Columns = styled.div`
  display: grid;
  grid-template-areas: 'manuscript';
  grid-template-columns: 100%;
  height: 100vh;
  justify-content: center;
  overflow: hidden;
`

const ManuscriptContainer = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;

  /* .wax-container {
    height: 100%;
    top: 0%;
  } */
`

const Production = ({
  file,
  manuscript,
  currentUser,
  // fileUpload,
  updateManuscript,
}) => (
  <Columns>
    {file &&
    file.mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
      <ManuscriptContainer>
        {manuscript ? (
          <ProductionWaxEditor 
            user={currentUser} 
            value={manuscript.meta.source}
            onBlur={
              source => {
                updateManuscript(manuscript.id, { meta: { source } })
              }
            }
            onChange={
              source => {
                updateManuscript(manuscript.id, { meta: { source } })
              }
            }
          />
        ) : (
          <Spinner />
        )}
      </ManuscriptContainer>
    ) : (
      <Info>No supported view of the file</Info>
    )}
  </Columns>
)

export default withRouter(Production)
