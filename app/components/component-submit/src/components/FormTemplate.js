import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Formik } from 'formik'
import { unescape, set } from 'lodash'
import { TextField, RadioGroup, CheckboxGroup } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
// import SimpleWaxEditor from '../../../wax-collab/src/SimpleWaxEditor'
import {
  Section as Container,
  Select,
  FilesUpload,
  Attachment,
} from '../../../shared'
import { Heading1, Section, Legend, SubNote } from '../style'
import AuthorsInput from './AuthorsInput'
import LinksInput from './LinksInput'
import ValidatedFieldFormik from './ValidatedField'
import Confirm from './Confirm'
import { articleStatuses } from '../../../../globals'
import { validateFormField } from '../../../../shared/formValidation'
import ActionButton from '../../../shared/ActionButton'
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

const SafeRadioGroup = styled(RadioGroup)`
  position: relative;
`

const NoteRight = styled.div`
  float: right;
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  text-align: right;
`

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
    <FormWaxEditor
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

const link = (urlFrag, manuscriptId) =>
  String.raw`<a href=${urlFrag}/versions/${manuscriptId}/manuscript>view here</a>`

const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

/** Rename some props so the various formik components can understand them */
const prepareFieldProps = rawField => ({
  ...rawField,
  options:
    rawField.options &&
    rawField.options.map(e => ({ ...e, color: e.labelColor })),
})

const InnerFormTemplate = ({
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
  initializeReview,
  isSubmitting,
  submitCount,
}) => {
  const submitButton = (text, haspopup = false) => {
    return (
      <div>
        <ActionButton
          onClick={async () => {
            if (republish && manuscriptStatus === articleStatuses.published) {
              republish(manuscriptId)
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
          status={
            // eslint-disable-next-line no-nested-ternary
            isSubmitting ? 'pending' : submitCount ? 'success' : ''
          }
        >
          {text}
        </ActionButton>
      </div>
    )
  }

  // this is what the submit button will say
  const submitButtonText =
    manuscriptStatus === isSubmission && articleStatuses.published
      ? 'Re-Publish'
      : submissionButtonText

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
            return (
              <Section
                cssOverrides={JSON.parse(element.sectioncss || '{}')}
                key={`${element.id}`}
              >
                <Legend dangerouslySetInnerHTML={createMarkup(element.title)} />
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
                    values={values}
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
                      validate={validateFormField(
                        element.validate,
                        element.validateValue,
                        element.name,
                        JSON.parse(
                          element.doiValidation ? element.doiValidation : false,
                        ),
                        validateDoi,
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

        {submittedManuscriptFile ? (
          <Section id="files.manuscript">
            <Legend space>Submitted Manuscript</Legend>
            <Attachment
              file={submittedManuscriptFile}
              key={submittedManuscriptFile.storedObjects[0].url}
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
}) => {
  const [confirming, setConfirming] = React.useState(false)

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }
// console.log(validateOnBlur,'validateOnBlur', validateOnChange, 'validateOnChange')
  return (
    <Formik
      displayName={form.name}
      initialValues={initialValues}
      onSubmit={onSubmit ?? (() => null)}
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
          form={form}
          initializeReview={initializeReview}
          manuscriptId={manuscriptId}
          manuscriptShortId={manuscriptShortId}
          manuscriptStatus={manuscriptStatus}
          onChange={onChange}
          republish={republish}
          reviewId={reviewId}
          shouldStoreFilesInForm={shouldStoreFilesInForm}
          showEditorOnlyFields={showEditorOnlyFields}
          submissionButtonText={submissionButtonText}
          tagForFiles={tagForFiles}
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
