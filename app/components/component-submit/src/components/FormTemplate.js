import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Formik } from 'formik'
import { unescape, get, set, debounce } from 'lodash'
import { sanitize } from 'dompurify'
import { TextField, RadioGroup, CheckboxGroup } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import {
  Section as Container,
  Select,
  FilesUpload,
  Attachment,
  FieldPublishingSelector,
} from '../../../shared'
import { Heading1, Section, Legend, SubNote } from '../style'
import AuthorsInput from './AuthorsInput'
import LinksInput from './LinksInput'
import ValidatedFieldFormik from './ValidatedField'
import Confirm from './Confirm'
import { articleStatuses } from '../../../../globals'
import { validateFormField } from '../../../../shared/formValidation'
import ThreadedDiscussion from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/ThreadedDiscussion'
import ActionButton from '../../../shared/ActionButton'
import { hasValue } from '../../../../shared/htmlUtils'
import FormWaxEditor from '../../../component-formbuilder/src/components/FormWaxEditor'

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

const LowerPadded = styled.div`
  padding-bottom: ${grid(3)};
`

const SafeRadioGroup = styled(RadioGroup)`
  position: relative;
`

const PaddedRadioGroup = props => (
  <LowerPadded>
    <SafeRadioGroup {...props} />
  </LowerPadded>
)

const PaddedCheckboxGroup = props => (
  <LowerPadded>
    <CheckboxGroup {...props} />
  </LowerPadded>
)

const PaddedSelect = props => (
  <LowerPadded>
    <Select {...props} />
  </LowerPadded>
)

const PaddedAuthorsInput = props => (
  <LowerPadded>
    <AuthorsInput {...props} />
  </LowerPadded>
)

const PaddedLinksInput = props => (
  <LowerPadded>
    <LinksInput {...props} />
  </LowerPadded>
)

const NoteRight = styled.div`
  float: right;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  text-align: right;
`

const FieldHead = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  width: auto;
`

const filterFileManuscript = files =>
  files.filter(file => file.tags.includes('manuscript'))

/** Definitions for available field types */
const elements = {
  TextField,
  RadioGroup: PaddedRadioGroup,
  CheckboxGroup: PaddedCheckboxGroup,
  AuthorsInput: PaddedAuthorsInput,
  Select: PaddedSelect,
  LinksInput: PaddedLinksInput,
  ThreadedDiscussion,
}

elements.AbstractEditor = ({
  validationStatus,
  setTouched,
  onChange,
  ...rest
}) => {
  return (
    <FormWaxEditor
      validationStatus={validationStatus}
      {...rest}
      onBlur={() => {
        setTouched(set({}, rest.name, true))
      }}
      onChange={val => {
        setTouched(set({}, rest.name, true))
        const cleanedVal = hasValue(val) ? val : ''
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

const link = (urlFrag, manuscriptId) =>
  String.raw`<a href=${urlFrag}/versions/${manuscriptId}/manuscript>view here</a>`

const createMarkup = encodedHtml => ({
  __html: sanitize(unescape(encodedHtml)),
})

/** Rename some props so the various formik components can understand them */
const prepareFieldProps = rawField => ({
  ...rawField,
  options:
    rawField.options &&
    rawField.options.map(e => ({ ...e, color: e.labelColor })),
})

const InnerFormTemplate = ({
  // TODO We could just combine InnerFormTemplate with FormTemplate. No good reason to separate them.
  form,
  handleSubmit, // formik
  toggleConfirming,
  confirming,
  manuscriptId,
  manuscriptShortId,
  manuscriptStatus,
  setTouched, // formik
  values, // formik
  setFieldValue, // formik
  submissionButtonText,
  onChange,
  republish,
  errors, // formik
  validateForm, // formik
  showEditorOnlyFields,
  urlFrag,
  displayShortIdAsIdentifier,
  validateDoi,
  createFile,
  deleteFile,
  isSubmission,
  reviewId,
  shouldStoreFilesInForm,
  tagForFiles,
  threadedDiscussionProps: tdProps,
  initializeReview,
  isSubmitting,
  submitCount,
  shouldShowOptionToPublish,
  fieldsToPublish = [],
  setShouldPublishField,
}) => {
  const [submitSucceeded, setSubmitSucceeded] = useState(false)
  const [disabled, setButtonDisabled] = useState(false)

  const submitButton = (text, haspopup = false) => {
    return (
      <div>
        <ActionButton
          dataTestid={`${form.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')}-action-btn`}
          disabled={disabled}
          onClick={async () => {
            // TODO shouldn't this come after error checking and submission?
            if (republish) {
              setButtonDisabled(true)
              await republish(manuscriptId)
              setButtonDisabled(false)
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
              setSubmitSucceeded(!hasErrors)
            } else {
              toggleConfirming()
            }
          }}
          primary
          status={
            /* eslint-disable no-nested-ternary */
            isSubmitting
              ? 'pending'
              : Object.keys(errors).length && submitCount
              ? '' // TODO Make this case 'failure', once we've fixed the validation delays in the form
              : submitSucceeded
              ? 'success'
              : ''
            /* eslint-enable no-nested-ternary */
          }
        >
          {text}
        </ActionButton>
      </div>
    )
  }

  // this is whether the form includes a popup
  const hasPopup = form.haspopup ? JSON.parse(form.haspopup) : false

  // this is whether to show a popup
  const showPopup = hasPopup && values.status !== 'revise'

  // this is whether or not to show a submit button
  const showSubmitButton =
    submissionButtonText &&
    (isSubmission
      ? !['submitted', 'revise'].includes(values.status) ||
        (['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
          values.status === 'submitted')
      : true)

  const manuscriptFiles = filterFileManuscript(values.files || [])

  const submittedManuscriptFile =
    isSubmission && manuscriptFiles.length ? manuscriptFiles[0] : null

  return (
    <Container>
      {displayShortIdAsIdentifier && (
        <NoteRight>
          Manuscript number
          <br />
          {manuscriptShortId}
        </NoteRight>
      )}
      <Heading1>{form.name}</Heading1>
      <Intro
        dangerouslySetInnerHTML={createMarkup(
          (form.description || '').replace(
            '###link###',
            link(urlFrag, manuscriptId),
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
          .map(prepareFieldProps)
          .map((element, i) => {
            let threadedDiscussionProps

            if (element.component === 'ThreadedDiscussion') {
              const setShouldPublishComment =
                shouldShowOptionToPublish &&
                element.permitPublishing === 'true' &&
                ((id, val) =>
                  setShouldPublishField(`${element.name}:${id}`, val))

              threadedDiscussionProps = {
                ...tdProps,
                threadedDiscussion: tdProps.threadedDiscussions.find(
                  d => d.id === values[element.name],
                ),
                threadedDiscussions: undefined,
                commentsToPublish: fieldsToPublish
                  .filter(f => f.startsWith(`${element.name}:`))
                  .map(f => f.split(':')[1]),
                setShouldPublishComment,
                userCanAddThread: true,
              }
            }

            return (
              <Section
                cssOverrides={JSON.parse(element.sectioncss || '{}')}
                key={`${element.id}`}
              >
                <FieldHead>
                  <Legend
                    dangerouslySetInnerHTML={createMarkup(element.title)}
                  />
                  {shouldShowOptionToPublish &&
                    element.permitPublishing === 'true' &&
                    element.component !== 'ThreadedDiscussion' && (
                      <FieldPublishingSelector
                        onChange={val =>
                          setShouldPublishField(element.name, val)
                        }
                        value={fieldsToPublish.includes(element.name)}
                      />
                    )}
                </FieldHead>
                {element.component === 'SupplementaryFiles' && (
                  <FilesUpload
                    createFile={createFile}
                    deleteFile={deleteFile}
                    fieldName={shouldStoreFilesInForm ? element.name : 'files'} // TODO Store files in form for submissions too: should simplify code both frontend and back.
                    fileType={tagForFiles || 'supplementary'}
                    initializeReview={initializeReview}
                    manuscriptId={manuscriptId}
                    onChange={shouldStoreFilesInForm ? onChange : null}
                    reviewId={reviewId}
                    values={values}
                  />
                )}
                {element.component === 'VisualAbstract' && (
                  <FilesUpload
                    acceptMultiple={false}
                    createFile={createFile}
                    deleteFile={deleteFile}
                    fieldName={shouldStoreFilesInForm ? element.name : 'files'}
                    fileType={tagForFiles || 'visualAbstract'}
                    initializeReview={initializeReview}
                    manuscriptId={manuscriptId}
                    mimeTypesToAccept="image/*"
                    onChange={shouldStoreFilesInForm ? onChange : null}
                    reviewId={reviewId}
                    values={values}
                  />
                )}
                {element.component === 'ManuscriptFile' &&
                submittedManuscriptFile ? (
                  <Attachment
                    file={submittedManuscriptFile}
                    key={submittedManuscriptFile.storedObjects[0].url}
                    uploaded
                  />
                ) : null}
                {![
                  'SupplementaryFiles',
                  'VisualAbstract',
                  'ManuscriptFile',
                ].includes(element.component) && (
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
                      'labelColor',
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
                    threadedDiscussionProps={threadedDiscussionProps}
                    validate={validateFormField(
                      element.validate,
                      element.validateValue,
                      element.name,
                      JSON.parse(
                        element.doiValidation ? element.doiValidation : false,
                      ),
                      validateDoi,
                      element.component,
                      threadedDiscussionProps,
                    )}
                    values={values}
                  />
                )}
                {hasValue(element.description) && (
                  <SubNote
                    dangerouslySetInnerHTML={createMarkup(element.description)}
                  />
                )}
              </Section>
            )
          })}

        {showSubmitButton
          ? submitButton(submissionButtonText, showPopup)
          : null}

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

const FormTemplate = ({
  form,
  initialValues,
  manuscriptId,
  manuscriptShortId,
  manuscriptStatus,
  submissionButtonText,
  onChange,
  republish,
  onSubmit,
  showEditorOnlyFields,
  urlFrag,
  displayShortIdAsIdentifier,
  validateDoi,
  createFile,
  deleteFile,
  isSubmission,
  reviewId,
  shouldStoreFilesInForm,
  initializeReview,
  tagForFiles,
  threadedDiscussionProps,
  fieldsToPublish,
  setShouldPublishField,
  shouldShowOptionToPublish = false,
}) => {
  const [confirming, setConfirming] = React.useState(false)

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }

  const sumbitPendingThreadedDiscussionComments = async values => {
    await Promise.all(
      form.children
        .filter(field => field.component === 'ThreadedDiscussion')
        .map(field => get(values, field.name))
        .filter(Boolean)
        .map(async threadedDiscussionId =>
          threadedDiscussionProps.completeComments({
            variables: { threadedDiscussionId },
          }),
        ),
    )
  }

  const createBlankSubmissionBasedOnForm = value => {
    const allBlankedFields = {}
    const fieldNames = value.children.map(field => field.name)
    fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
    return allBlankedFields
  }

  const initialValuesWithDummyValues = {
    ...createBlankSubmissionBasedOnForm(form),
    ...initialValues,
  }

  const [lastChangedField, setLastChangedField] = useState(null)
  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  return (
    <Formik
      displayName={form.name}
      initialValues={initialValuesWithDummyValues}
      onSubmit={async (values, actions) => {
        await sumbitPendingThreadedDiscussionComments(values)
        if (onSubmit) await onSubmit(values, actions)
      }}
      validateOnBlur
      validateOnChange={false}
    >
      {formProps => (
        <InnerFormTemplate
          confirming={confirming}
          createFile={createFile}
          deleteFile={deleteFile}
          isSubmission={isSubmission}
          toggleConfirming={toggleConfirming}
          {...formProps}
          displayShortIdAsIdentifier={displayShortIdAsIdentifier}
          fieldsToPublish={fieldsToPublish}
          form={form}
          initializeReview={initializeReview}
          manuscriptId={manuscriptId}
          manuscriptShortId={manuscriptShortId}
          manuscriptStatus={manuscriptStatus}
          onChange={(value, fieldName) => {
            if (fieldName !== lastChangedField) {
              debounceChange.flush()
              setLastChangedField(fieldName)
            }

            debounceChange(value, fieldName)
          }}
          republish={republish}
          reviewId={reviewId}
          setShouldPublishField={setShouldPublishField}
          shouldShowOptionToPublish={shouldShowOptionToPublish}
          shouldStoreFilesInForm={shouldStoreFilesInForm}
          showEditorOnlyFields={showEditorOnlyFields}
          submissionButtonText={submissionButtonText}
          tagForFiles={tagForFiles}
          threadedDiscussionProps={threadedDiscussionProps}
          urlFrag={urlFrag}
          validateDoi={validateDoi}
        />
      )}
    </Formik>
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
  manuscriptId: PropTypes.string.isRequired,
  manuscriptShortId: PropTypes.number.isRequired,
  manuscriptStatus: PropTypes.string,
  initialValues: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
        // eslint-disable-next-line react/forbid-prop-types
        storedObjects: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    ),
    status: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  republish: PropTypes.func,
  submissionButtonText: PropTypes.string,
  showEditorOnlyFields: PropTypes.bool.isRequired,
  shouldStoreFilesInForm: PropTypes.bool,
  /** If supplied, any uploaded files will be tagged with this rather than 'supplementary' or 'visualAbstract' */
  tagForFiles: PropTypes.string,
  initializeReview: PropTypes.func,
}
FormTemplate.defaultProps = {
  onSubmit: undefined,
  initialValues: null,
  republish: null,
  submissionButtonText: '',
  manuscriptStatus: null,
  shouldStoreFilesInForm: false,
  tagForFiles: null,
  initializeReview: null,
}

export default FormTemplate
