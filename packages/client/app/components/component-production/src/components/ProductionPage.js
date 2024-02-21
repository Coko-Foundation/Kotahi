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
	teams {
		role
		members {
			user {
				id
				created
			}
      created
		}
	}
  ${fileFragment}
	submission
  meta {
    source
    manuscriptId
  }
  authorFeedback {
    text
    fileIds
    edited
    submitted
    submitter {
      username
      defaultIdentity {
        name
      }
      id
    }
    assignedAuthors {
      authorName
      assignedOnDate
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID!, $isCms: Boolean!) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    articleTemplate(groupId: $groupId, isCms: $isCms) {
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

const submitAuthorProofingFeedbackMutation = gql`
  mutation($id: ID!, $input: String) {
    submitAuthorProofingFeedback(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const showAuthorProofingMode = (manuscript, currentUser, updateManuscript) => {
  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  const isAuthorProofingAssignedToAuthor =
    manuscript.status === 'assigned' &&
    sortedAuthors[0]?.user?.id === currentUser.id

  if (isAuthorProofingAssignedToAuthor) {
    updateManuscript(manuscript.id, { status: 'inProgress' })
  }

  return (
    ['assigned', 'inProgress', 'completed'].includes(manuscript.status) &&
    sortedAuthors[0]?.user?.id === currentUser.id
  )
}

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
  const [hideEditorSection, setHideEditorSection] = React.useState(false)
  // const [saving, setSaving] = React.useState(false)
  // const [downloading, setDownloading] = React.useState(false)

  // const [currentJats, setCurrentJats] = React.useState({
  //   xml: '',
  //   error: false,
  // })

  const [update] = useMutation(updateMutation)

  const [submitAuthorProofingFeedback] = useMutation(
    submitAuthorProofingFeedbackMutation,
  )

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
      isCms: false,
    },
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const manuscript = {
    ...data.manuscript,
    submission: JSON.parse(data.manuscript.submission),
  }

  const { submissionForm, articleTemplate } = data

  const isAuthorProofingMode = showAuthorProofingMode(
    manuscript,
    currentUser,
    updateManuscript,
  ) // If true, we are in author proofing mode

  const isReadOnlyMode =
    (isAuthorProofingMode && ['completed'].includes(manuscript.status)) ||
    (['assigned', 'inProgress'].includes(manuscript.status) &&
      !isAuthorProofingMode) // If author proofing is enabled, but we are not the author or author has completed author proofing, we go read-only

  // console.log('Author proofing mode: ', isAuthorProofingMode)
  // console.log('Read only mode: ', isReadOnlyMode)

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
            hideEditorSection={hideEditorSection}
            isAuthorProofingVersion={isAuthorProofingMode}
            isReadOnlyVersion={isReadOnlyMode}
            makeJats={setMakingJats}
            makePdf={setMakingPdf}
            manuscript={manuscript}
            onAssetManager={onAssetManager}
            setHideEditorSection={setHideEditorSection}
            submitAuthorProofingFeedback={submitAuthorProofingFeedback}
            updateManuscript={(a, b) => {
              // TODO: This might need to be different based on value of isAuthorProofingMode?
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
