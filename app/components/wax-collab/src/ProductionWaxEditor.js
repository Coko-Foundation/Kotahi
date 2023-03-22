import React, { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { ThemeProvider } from 'styled-components'
import { gql, useApolloClient } from '@apollo/client'
import waxTheme from './layout/waxTheme'
import { JournalContext } from '../../xpub-journal/src'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

const getAnystyleQuery = gql`
  query($textReferences: String!) {
    buildCitations(textReferences: $textReferences) {
      htmlReferences
      error
    }
  }
`

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const ProductionWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  saveSource,
  placeholder,
  readOnlyComments,
  fileUpload,
  useComments,
  user,
  manuscriptId,
  onAssetManager,
  ...rest
}) => {
  const handleAssetManager = () => onAssetManager(manuscriptId)
  const journal = useContext(JournalContext)

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const client = useApolloClient()

  const editorRef = useRef(null)

  useEffect(() => {
    return () => {
      if (editorRef.current && saveSource !== null) {
        saveSource(editorRef.current.getContent())
      }
    }
  }, [])

  const updateAnystyle = async text => {
    const { content } = text
    // eslint-disable-next-line no-console
    console.log('Coming in: ', content)
    return client
      .query({
        query: getAnystyleQuery,
        variables: {
          textReferences: content,
        },
        fetchPolicy: 'network-only',
      })
      .then(result => {
        // eslint-disable-next-line no-console
        console.log('Result:', result?.data?.buildCitations?.htmlReferences)

        if (
          result?.data?.buildCitations?.htmlReferences &&
          !result?.data?.buildCitations?.error
        ) {
          return result.data.buildCitations.htmlReferences
        }

        console.error('Server-side error: ', result.data.buildCitations.error)
        return content
      })
  }

  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div className={validationStatus}>
        <Wax
          autoFocus={autoFocus}
          config={productionWaxEditorConfig(
            readOnlyComments,
            handleAssetManager,
            updateAnystyle,
          )}
          fileUpload={file => renderImage(file)}
          layout={
            useComments
              ? ProductionWaxEditorLayout(readonly)
              : ProductionWaxEditorNoCommentsLayout(readonly)
          }
          onChange={source => {
            saveSource(source)
          }}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          user={waxUser}
          value={value}
          {...rest}
        />
      </div>
    </ThemeProvider>
  )
}

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
  readOnlyComments: PropTypes.bool,
  useComments: PropTypes.bool,
  user: PropTypes.shape({
    userId: PropTypes.string,
    userName: PropTypes.string,
    userColor: PropTypes.shape({
      addition: PropTypes.string,
      deletion: PropTypes.string,
    }),
  }),
}

ProductionWaxEditor.defaultProps = {
  value: '',
  validationStatus: '',
  readonly: false,
  autoFocus: false,
  placeholder: '',
  readOnlyComments: false,
  fileUpload: () => {},
  saveSource: () => {},
  useComments: true,
  user: {},
}

export default ProductionWaxEditor
