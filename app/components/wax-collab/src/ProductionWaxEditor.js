import React, { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { ThemeProvider } from 'styled-components'
import { gql } from '@apollo/client'
import waxTheme from './layout/waxTheme'
import { JournalContext } from '../../xpub-journal/src'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

const getAnystyleCslQuery = gql`
  query($textReferences: String!) {
    buildCitationsCSL(textReferences: $textReferences) {
      cslReferences
      error
    }
  }
`

const getCrossRefQuery = gql`
  query($input: CitationSearchInput) {
    getFormattedReferences(input: $input) {
      success
      message
      matches {
        doi
        author {
          given
          family
          sequence
        }
        issue
        page
        title
        volume
        journalTitle
        formattedCitation
      }
    }
  }
`

const getCiteProcQuery = gql`
  query($citation: String!) {
    formatCitation(citation: $citation) {
      formattedCitation
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
  client,
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
    // console.log('Coming in for Anystyle: ', content)
    return client
      .query({
        query: getAnystyleCslQuery,
        variables: {
          textReferences: content,
        },
        fetchPolicy: 'network-only',
      })
      .then(result => {
        // eslint-disable-next-line no-console
        // console.log('Result:', result)

        if (
          result?.data?.buildCitationsCSL?.cslReferences &&
          !result?.data?.buildCitationsCSL?.error
        ) {
          // console.log(
          //   'Coming back from Anystyle CSL: ',
          //   result.data.buildCitationsCSL.cslReferences,
          // )
          return result.data.buildCitationsCSL.cslReferences
        }

        console.error(
          'Server-side error: ',
          result.data.buildCitationsCSL.error,
        )
        return content
      })
  }

  const updateCrossRef = async text => {
    // eslint-disable-next-line no-console
    // console.log('Coming in for CrossRef: ', text, count)
    return text
      ? client
          .query({
            query: getCrossRefQuery,
            variables: {
              input: {
                text,
                // count, // We could have this in there if we wanted more results to override the default
              },
            },
            fetchPolicy: 'network-only',
          })
          .then(result => {
            // eslint-disable-next-line no-console
            // console.log('Result:', result)

            if (
              result?.data?.getFormattedReferences?.success &&
              result.data.getFormattedReferences.matches &&
              result.data.getFormattedReferences.matches.length
            ) {
              // This returns an array of CSL
              return result.data.getFormattedReferences.matches
            }

            console.error(
              'Server-side error: ',
              result.data.getFormattedReferences.message,
            )
            return text
          })
      : null
  }

  const updateCiteProc = async csl => {
    // eslint-disable-next-line no-console
    // console.log('Coming in for citeproc: ', csl)
    return client
      .query({
        query: getCiteProcQuery,
        variables: {
          citation: JSON.stringify(csl),
        },
        fetchPolicy: 'network-only',
      })
      .then(result => {
        // eslint-disable-next-line no-console
        // console.log('Citeproc result:', result)

        if (result?.data?.formatCitation?.formattedCitation) {
          // This returns an array of CSL
          return result.data.formatCitation.formattedCitation
        }

        console.error('Server-side error: ', result.data.formatCitation.error)
        return JSON.stringify(csl)
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
            updateCrossRef,
            updateCiteProc,
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
