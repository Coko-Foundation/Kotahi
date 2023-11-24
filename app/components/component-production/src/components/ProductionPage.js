/* eslint-disable no-shadow */
import React, { useContext } from 'react'
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import { adopt } from 'react-adopt'
import Production from './Production'
import { ConfigContext } from '../../../config/src'
import { Spinner, CommsErrorBanner } from '../../../shared'
import { getSpecificFilesQuery } from '../../../asset-manager/src/queries'
import withModal from '../../../asset-manager/src/ui/Modal/withModal'
import DownloadPdfComponent from './DownloadPdf'
import DownloadJatsComponent from './DownloadJats'

const mapper = {
  getSpecificFilesQuery,
  withModal,
}

const mapProps = args => ({
  onAssetManager: manuscriptId =>
    new Promise((resolve, reject) => {
      const {
        withModal: { showModal, hideModal },
      } = args

      const handleImport = async selectedFileIds => {
        const {
          getSpecificFilesQuery: { client, query },
        } = args

        const { data } = await client.query({
          query,
          variables: { ids: selectedFileIds },
        })

        const { getSpecificFiles: files } = data

        const alteredFiles = files.map(file => {
          const mediumSizeFile = file.storedObjects.find(
            storedObject => storedObject.type === 'medium',
          )

          return {
            source: mediumSizeFile.url,
            mimetype: mediumSizeFile.mimetype,
            ...file,
          }
        })

        hideModal()
        resolve(alteredFiles)
      }

      showModal('assetManagerEditor', {
        manuscriptId,
        withImport: true,
        handleImport,
      })
    }),
})

const Composed = adopt(mapper, mapProps)

const fileFragment = `
  files {
    id
    name
    tags
    created
    storedObjects {
      type
      key
      mimetype
      size
      url
    }
  }
`

const formFields = `
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      doiUniqueSuffixValidation
      placeholder
      permitPublishing
      parse
      format
      options {
        id
        label
        labelColor
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
    }
  }
`

const fragmentFields = `
  id
  created
  status
  ${fileFragment}
	submission
  meta {
    title
    source
		abstract
    manuscriptId
  }
`

const query = gql`
  query($id: ID!, $groupId: ID!) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    articleTemplate(groupId: $groupId) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
	}
`

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

export const updateTemplateMutation = gql`
  mutation($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      groupId
      ${fileFragment}
      article
      css
    }
  }
`

const ProductionPage = ({ currentUser, match, ...props }) => {
  const { groupId, controlPanel } = useContext(ConfigContext)
  const client = useApolloClient()
  const [makingPdf, setMakingPdf] = React.useState(false)
  const [makingJats, setMakingJats] = React.useState(false)
  // const [saving, setSaving] = React.useState(false)
  // const [downloading, setDownloading] = React.useState(false)

  // const [currentJats, setCurrentJats] = React.useState({
  //   xml: '',
  //   error: false,
  // })

  const [update] = useMutation(updateMutation)
  const [updateTempl] = useMutation(updateTemplateMutation)

  const updateManuscript = async (versionId, manuscriptDelta) => {
    const newQuery = await update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

    return newQuery
  }

  const updateTemplate = (id, input) =>
    updateTempl({ variables: { id, input } })

  const { data, loading, error } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { manuscript, submissionForm, articleTemplate } = data

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <Composed
      articleTemplate={articleTemplate}
      client={client}
      currentUser={currentUser}
      form={form}
      manuscript={manuscript}
      setMakingJats={setMakingJats}
      setMakingPdf={setMakingPdf}
      updateManuscript={updateManuscript}
      updateTemplate={updateTemplate}
    >
      {({ onAssetManager }) => (
        <div>
          {makingPdf ? (
            <DownloadPdfComponent
              manuscript={manuscript}
              resetMakingPdf={() => {
                // refetch({ id: match.params.version, manuscriptId: manuscript.id })
                // console.log('resetMakingPdf fired!')
                setMakingPdf(false)
              }}
            />
          ) : null}
          {makingJats ? (
            <DownloadJatsComponent
              manuscript={manuscript}
              resetMakingJats={() => {
                setTimeout(() => {
                  setMakingJats(false)
                }, 1000)
              }}
            />
          ) : null}
          <Production
            articleTemplate={articleTemplate}
            client={client}
            currentUser={currentUser}
            displayShortIdAsIdentifier={controlPanel?.displayManuscriptShortId}
            file={manuscript.files.find(file =>
              file.tags.includes('manuscript'),
            )}
            form={form}
            makeJats={setMakingJats}
            makePdf={setMakingPdf}
            manuscript={manuscript}
            onAssetManager={onAssetManager}
            updateManuscript={(a, b) => {
              // eslint-disable-next-line
              // console.log('in update manuscript!')
              updateManuscript(a, b)
            }}
            updateTemplate={updateTemplate}
          />
        </div>
      )}
    </Composed>
  )
}

ProductionPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ProductionPage
