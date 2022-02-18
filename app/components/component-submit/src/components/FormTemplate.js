import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { unescape, set } from 'lodash'
import {
  TextField,
  RadioGroup,
  CheckboxGroup,
  Button,
  Attachment,
} from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import config from 'config'
import { useApolloClient } from '@apollo/client'
import SimpleWaxEditor from '../../../wax-collab/src/SimpleWaxEditor'
import { Section as Container, Select, FilesUpload } from '../../../shared'
import { Heading1, Section, Legend, SubNote } from '../style'
import AuthorsInput from './AuthorsInput'
import LinksInput from './LinksInput'
import ValidatedFieldFormik from './ValidatedField'
import Confirm from './Confirm'
import { articleStatuses } from '../../../../globals'
import { validateFormField } from '../../../../shared/formValidation'

const Intro = styled.div`
  font-style: italic;
  line-height: 1.4;
`

const ModalWrapper = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10000;
`

const SafeRadioGroup = styled(RadioGroup)`
  position: relative;
`

const NoteRight = styled.div`
  float: right;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  text-align: right;
`

const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const filterFileManuscript = files =>
  files.filter(
    file =>
      file.tags.includes('manuscript') &&
      file.storedObjects[0].mimetype !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

/** Definitions for available field types */
const elements = {
  TextField,
  RadioGroup: SafeRadioGroup,
  CheckboxGroup,
  AuthorsInput,
  Select,
  LinksInput,
}

elements.AbstractEditor = ({
  validationStatus,
  setTouched,
  onChange,
  ...rest
}) => {
  return (
    <SimpleWaxEditor
      validationStatus={validationStatus}
      {...rest}
      onBlur={() => {
        setTouched(set({}, rest.name, true))
      }}
      onChange={val => {
        setTouched(set({}, rest.name, true))
        const cleanedVal = val === '<p class="paragraph"></p>' ? '' : val
        onChange(cleanedVal)
      }}
    />
  )
}

elements.AbstractEditor.propTypes = {
  validationStatus: PropTypes.string,
  setTouched: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}
elements.AbstractEditor.defaultProps = {
  validationStatus: undefined,
}

/** Shallow clone props, leaving out all specified keys, and also stripping all keys with (string) value 'false'. */
const rejectProps = (obj, keys) =>
  Object.keys(obj)
    .filter(k => !keys.includes(k))
    .map(k => ({ [k]: obj[k] }))
    .reduce(
      (res, o) =>
        Object.values(o).includes('false') ? { ...res } : Object.assign(res, o),
      {},
    )

const urlFrag = config.journal.metadata.toplevel_urlfragment

const link = (journal, manuscript) =>
  String.raw`<a href=${urlFrag}/versions/${manuscript.id}/manuscript>view here</a>`

const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

const FormTemplate = ({
  form,
  handleSubmit,
  journal,
  toggleConfirming,
  confirming,
  manuscript,
  setTouched,
  values,
  setFieldValue,
  submissionButtonText,
  createSupplementaryFile,
  onChange,
  republish,
  onSubmit,
  submitSubmission,
  errors,
  validateForm,
  showEditorOnlyFields,
}) => {
  const client = useApolloClient()

  const submitButton = (text, haspopup = false) => {
    return (
      <div>
        <Button
          onClick={async () => {
            if (manuscript.status === articleStatuses.published) {
              republish(manuscript.id)

              return
            }

            const hasErrors = Object.keys(await validateForm()).length !== 0

            // If there are errors, do a fake submit
            // to focus on the error
            if (
              hasErrors ||
              values.status === articleStatuses.evaluated ||
              values.status === articleStatuses.submitted ||
              !haspopup
            ) {
              handleSubmit()
            } else {
              toggleConfirming()
            }
          }}
          primary
          type="button"
        >
          {text}
        </Button>
      </div>
    )
  }

  // this is true if it's the decision page, not if it's the submit page
  const isDecision = submissionButtonText === ''

  // this is what the submit button will say
  const submitButtonText =
    manuscript.status === articleStatuses.published
      ? 'Re-Publish'
      : submissionButtonText

  // this is whether the form includes a popup
  const hasPopup = form.haspopup ? JSON.parse(form.haspopup) : false

  // this is whether to show a popup
  const showPopup = hasPopup && values.status !== 'revise'

  // this is whether or not to show a submit button
  const showSubmitButton =
    !isDecision &&
    ((['aperture', 'colab'].includes(process.env.INSTANCE_NAME) &&
      !['submitted', 'revise'].includes(values.status)) ||
      (['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
        !['revise'].includes(values.status)) ||
      values.status === 'revise')

  return (
    <Container>
      {config['client-features'].displayShortIdAsIdentifier &&
        config['client-features'].displayShortIdAsIdentifier.toLowerCase() ===
          'true' && (
          <NoteRight>
            Manuscript number
            <br />
            {manuscript.shortId}
          </NoteRight>
        )}
      <Heading1>{form.name}</Heading1>
      <Intro
        dangerouslySetInnerHTML={createMarkup(
          (form.description || '').replace(
            '###link###',
            link(journal, manuscript),
          ),
        )}
      />
      <form>
        {(form.children || [])
          .filter(
            element =>
              element.component &&
              (showEditorOnlyFields || element.hideFromAuthors !== 'true'),
          )
          .map((element, i) => {
            return (
              <Section
                cssOverrides={JSON.parse(element.sectioncss || '{}')}
                key={`${element.id}`}
              >
                <Legend dangerouslySetInnerHTML={createMarkup(element.title)} />
                {element.component === 'SupplementaryFiles' && (
                  <FilesUpload
                    fileType="supplementary"
                    manuscriptId={manuscript.id}
                  />
                )}
                {element.component === 'VisualAbstract' && (
                  <FilesUpload
                    acceptMultiple={false}
                    fileType="visualAbstract"
                    manuscriptId={manuscript.id}
                    mimeTypesToAccept="image/*"
                  />
                )}
                {element.component !== 'SupplementaryFiles' &&
                  element.component !== 'VisualAbstract' && (
                    <ValidatedFieldFormik
                      {...rejectProps(element, [
                        'component',
                        'title',
                        'sectioncss',
                        'parse',
                        'format',
                        'validate',
                        'validateValue',
                        'description',
                        'shortDescription',
                      ])}
                      aria-label={element.placeholder || element.title}
                      component={elements[element.component]}
                      data-testid={element.name} // TODO: Improve this
                      key={`validate-${element.id}`}
                      name={element.name}
                      onChange={value => {
                        // TODO: Perhaps split components remove conditions here
                        let val

                        if (value.target) {
                          val = value.target.value
                        } else if (value.value) {
                          val = value.value
                        } else {
                          val = value
                        }

                        setFieldValue(element.name, val, false)
                        onChange(val, element.name)
                      }}
                      readonly={element.name === 'submission.editDate'}
                      setTouched={setTouched}
                      spellCheck
                      validate={validateFormField(
                        element.validate,
                        element.validateValue,
                        element.name,
                        JSON.parse(
                          element.doiValidation ? element.doiValidation : false,
                        ),
                        client,
                        element.component,
                      )}
                      values={values}
                    />
                  )}
                <SubNote
                  dangerouslySetInnerHTML={createMarkup(element.description)}
                />
              </Section>
            )
          })}

        {filterFileManuscript(values.files || []).length > 0 ? (
          <Section id="files.manuscript">
            <Legend space>Submitted Manuscript</Legend>
            <Attachment
              file={filesToAttachment(filterFileManuscript(values.files)[0])}
              key={filterFileManuscript(values.files)[0].url}
              uploaded
            />
          </Section>
        ) : null}

        {showSubmitButton ? submitButton(submitButtonText, showPopup) : null}

        {confirming && (
          <ModalWrapper>
            <Confirm
              errors={errors}
              form={form}
              submit={handleSubmit}
              toggleConfirming={toggleConfirming}
            />
          </ModalWrapper>
        )}
      </form>
    </Container>
  )
}

FormTemplate.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sectioncss: PropTypes.string,
        id: PropTypes.string.isRequired,
        component: PropTypes.string.isRequired,
        group: PropTypes.string,
        placeholder: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.object.isRequired),
        validateValue: PropTypes.objectOf(
          PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired,
          ]).isRequired,
        ),
        hideFromAuthors: PropTypes.string,
      }).isRequired,
    ).isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
    haspopup: PropTypes.string.isRequired, // bool as string
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  journal: PropTypes.any, // currently unused
  toggleConfirming: PropTypes.func.isRequired,
  confirming: PropTypes.bool.isRequired,
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string,
  }).isRequired,
  setTouched: PropTypes.func.isRequired,
  values: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
        storedObjects: PropTypes.arrayOf(PropTypes.object),
        url: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
    status: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  createSupplementaryFile: PropTypes.any, // currently unused
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  republish: PropTypes.func.isRequired,
  submitSubmission: PropTypes.func,
  submissionButtonText: PropTypes.string,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
  validateForm: PropTypes.func.isRequired,
  showEditorOnlyFields: PropTypes.bool.isRequired,
}
FormTemplate.defaultProps = {
  journal: undefined,
  onSubmit: undefined,
  submitSubmission: undefined,
  createSupplementaryFile: undefined,
  submissionButtonText: '',
}

export default FormTemplate
