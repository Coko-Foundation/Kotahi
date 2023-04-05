import React from 'react'
import { get } from 'lodash'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'
import { Affiliation, Email } from '../style'
import { Attachment } from '../../../../shared'
import ThreadedDiscussion from '../../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/ThreadedDiscussion'

const ReadonlyFieldData = ({
  fieldName,
  form,
  formData,
  threadedDiscussionProps,
}) => {
  const data = get(formData, fieldName)
  const fieldDefinition = form.children?.find(field => field.name === fieldName)

  if (fieldDefinition?.component === 'AuthorsInput' && Array.isArray(data)) {
    return (data || []).map((author, i) => {
      const firstName = author.firstName || '?'
      const lastName = author.lastName || '?'

      const affiliation = author.affiliation ? ` (${author.affiliation})` : ''

      return (
        // eslint-disable-next-line react/no-array-index-key
        <p key={i}>
          {lastName}, {firstName}
          <Affiliation>{affiliation}</Affiliation> <Email>{author.email}</Email>
        </p>
      )
    })
  }

  if (fieldDefinition?.component === 'LinksInput' && Array.isArray(data)) {
    return data.map(link => (
      <p key={link.url}>
        <a href={link.url} rel="noopener noreferrer" target="_blank">
          {link.url}
        </a>
      </p>
    ))
  }

  if (fieldDefinition?.component === 'ThreadedDiscussion' && data) {
    // data should be the threadedDiscussion ID
    const discussion = threadedDiscussionProps.threadedDiscussions.find(
      d => d.id === data,
    ) || {
      threads: [],
    }

    const augmentedThreadedDiscussionProps = {
      ...threadedDiscussionProps,
      threadedDiscussion: discussion,
      threadedDiscussions: undefined,
      shouldRenderSubmitButton: true,
    }

    return (
      <ThreadedDiscussion
        threadedDiscussionProps={augmentedThreadedDiscussionProps}
      />
    )
  }

  if (
    ['SupplementaryFiles', 'VisualAbstract'].includes(
      fieldDefinition?.component,
    ) &&
    Array.isArray(data)
  ) {
    return data.map(file => (
      <Attachment file={file} key={file.storedObjects[0].url} uploaded />
    ))
  }

  if (
    // Shows supplementary, visualAbstract, manuscript tagged files in Metadata submission form
    ['SupplementaryFiles', 'VisualAbstract', 'ManuscriptFile'].includes(
      fieldDefinition?.component,
    ) &&
    Array.isArray(formData.files)
  ) {
    const supplementaryFiles = formData.files.filter(file =>
      file.tags.includes('supplementary'),
    )

    const visualAbstractFiles = formData.files.filter(file =>
      file.tags.includes('visualAbstract'),
    )

    const manuscriptFiles = formData.files.filter(file =>
      file.tags.includes('manuscript'),
    )

    if (
      fieldDefinition?.component === 'SupplementaryFiles' &&
      supplementaryFiles.length > 0
    )
      return supplementaryFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))

    if (
      fieldDefinition?.component === 'VisualAbstract' &&
      visualAbstractFiles.length > 0
    )
      return visualAbstractFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))

    if (
      fieldDefinition?.component === 'ManuscriptFile' &&
      manuscriptFiles.length > 0
    )
      return manuscriptFiles.map(file => (
        <Attachment file={file} key={file.storedObjects[0].url} uploaded />
      ))
  }

  if (Array.isArray(data)) {
    return data.join(', ')
  }

  if (data && fieldDefinition?.component === 'AbstractEditor')
    return <SimpleWaxEditor readonly value={data} />

  return data || (data === 0 ? '0' : null)
}

export default ReadonlyFieldData
