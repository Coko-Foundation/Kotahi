import React from 'react'
import styled from 'styled-components'
import Tooltip from 'rc-tooltip'
import { InfoIcon } from '../style'
import { stripHtml } from '../../../component-review/src/components/review/util'

const FloatingIcon = styled.div`
  float: right;
`

const getAbstractAsPlainText = manuscript => {
  const abstract = manuscript.meta.abstract ?? manuscript.submission.abstract
  // Some abstracts are incorrectly imported from Pubmed as an array of strings. Even once we fix this bug #628 we'll have to handle historic data containing arrays.
  return stripHtml(Array.isArray(abstract) ? abstract.join(' ') : abstract)
}

/** Render the title;
 * if manuscript.submission.articleURL exists, the title will be hyperlinked to this;
 * if abstract exists, a floating info icon will show the abstract on hover. */
const TitleWithAbstractAsTooltip = ({ manuscript }) => {
  const title =
    manuscript.meta.title || manuscript.submission.articleDescription || ''

  let url = manuscript.submission.articleURL
  if (url === 'https://doi.org/') url = null // For some reason, some URLs come in as this generic address, which is useless to the user.

  const abstract = getAbstractAsPlainText(manuscript)

  return (
    <div>
      {abstract && (
        <FloatingIcon>
          <Tooltip
            destroyTooltipOnHide={{ keepParent: false }}
            getTooltipContainer={el => el}
            overlay={
              <span>
                {abstract.length > 1000
                  ? `${abstract.slice(0, 1000)}...`
                  : abstract}
              </span>
            }
            overlayInnerStyle={{
              backgroundColor: 'black',
              color: 'white',
              borderColor: 'black',
              fontWeight: 'normal',
            }}
            overlayStyle={{
              width: '40em',
              maxWidth: '65vw',
              wordBreak: 'break-word',
            }}
            placement="bottomLeft"
            trigger={['hover']}
          >
            <InfoIcon />
          </Tooltip>
        </FloatingIcon>
      )}
      <span style={{ wordBreak: 'break-word' }}>
        {url ? (
          <a href={url} rel="noreferrer" target="_blank">
            {title}
          </a>
        ) : (
          title
        )}
      </span>
    </div>
  )
}

export default TitleWithAbstractAsTooltip
