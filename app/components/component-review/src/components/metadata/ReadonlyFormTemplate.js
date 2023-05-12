import PropTypes from 'prop-types'
import React from 'react'
import ReadonlyFieldData from './ReadonlyFieldData'
import { Title, SectionHeader, SectionRowGrid, Heading, Cell } from '../style'
import { SectionContent } from '../../../../shared'

const ReadonlyFormTemplate = ({
  form,
  formData,
  hideSpecialInstructions,
  manuscript,
  showEditorOnlyFields,
  title,
  displayShortIdAsIdentifier,
  threadedDiscussionProps,
  allowAuthorsSubmitNewVersion,
}) => {
  return (
    <SectionContent>
      {title ? (
        <SectionHeader>
          <Title>{title}</Title>
        </SectionHeader>
      ) : null}

      {displayShortIdAsIdentifier &&
        manuscript && ( // TODO The shortId shouldn't be rendered as part of this component. Split out!
          <SectionRowGrid>
            <Heading>Manuscript Number</Heading>
            <Cell>{manuscript.shortId}</Cell>
          </SectionRowGrid>
        )}

      {form.children
        .filter(element => {
          return (
            (showEditorOnlyFields || element.hideFromAuthors !== 'true') &&
            element.hideFromReviewers !== 'true'
          )
        })
        .map(element => (
          <SectionRowGrid key={element.id}>
            <Heading>{element.shortDescription || element.title}</Heading>
            <Cell>
              <ReadonlyFieldData
                allowAuthorsSubmitNewVersion={allowAuthorsSubmitNewVersion}
                fieldName={element.name}
                form={form}
                formData={formData}
                threadedDiscussionProps={threadedDiscussionProps}
              />
            </Cell>
          </SectionRowGrid>
        ))}
    </SectionContent>
  )
}

ReadonlyFormTemplate.propTypes = {
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        component: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  manuscript: PropTypes.shape({
    meta: PropTypes.shape({}).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        storedObjects: PropTypes.arrayOf(PropTypes.object),
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
      }).isRequired,
    ),
  }),
  showEditorOnlyFields: PropTypes.bool,
}

ReadonlyFormTemplate.defaultProps = {
  manuscript: null,
  showEditorOnlyFields: false,
}

export default ReadonlyFormTemplate
