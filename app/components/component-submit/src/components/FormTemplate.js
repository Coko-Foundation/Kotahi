import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { unescape, get, set } from 'lodash'
import {
  TextField,
  RadioGroup,
  CheckboxGroup,
  Button,
  Attachment,
} from '@pubsweet/ui'
import * as validators from 'xpub-validators'
import { AbstractEditor } from 'xpub-edit'
import config from 'config'
import { useApolloClient } from '@apollo/client'
import { Section as Container, Select, FilesUpload } from '../../../shared'
import { Heading1, Section, Legend, SubNote } from '../style'
import AuthorsInput from './AuthorsInput'
import LinksInput from './LinksInput'
import ValidatedFieldFormik from './ValidatedField'
import Confirm from './Confirm'
import { articleStatuses } from '../../../../globals'
import { VALIDATE_DOI } from '../../../../queries/index'

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
`

const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const filterFileManuscript = files =>
  files.filter(
    file =>
      file.fileType === 'manuscript' &&
      file.mimeType !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

// Add the AbstractEditor and AuthorsInput to the list of available form elements
const elements = { TextField, RadioGroup, CheckboxGroup }
elements.AbstractEditor = ({
  validationStatus,
  setTouched,
  onChange,
  value,
  values,
  ...rest
}) => (
  <AbstractEditor
    bulletlist
    joinaboveblock
    liftitem
    link
    orderedlist
    value={get(values, rest.name) || ''}
    {...rest}
    onChange={val => {
      setTouched(set({}, rest.name, true))
      onChange(val)
    }}
  />
)

elements.AbstractEditor.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  validationStatus: PropTypes.any, // Currently unused
  setTouched: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  values: PropTypes.objectOf(PropTypes.string).isRequired,
}
elements.AbstractEditor.defaultProps = {
  validationStatus: undefined,
}

elements.AuthorsInput = AuthorsInput
elements.Select = Select
elements.LinksInput = LinksInput

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

const composeValidate = (
  vld = [],
  valueField = {},
  fieldName,
  doiValidation = false,
  client,
  componentType,
) => value => {
  const validator = vld || []

  if (validator.length === 0) return undefined
  const errors = []
  validator
    .map(v => v.value)
    .map(validatorFn => {
      // if there is YSWYG component and it's empty - the value is a paragraph
      const valueFormatted =
        componentType === 'AbstractEditor' && value === '<p></p>' ? '' : value

      const error =
        validatorFn === 'required'
          ? validators[validatorFn](valueFormatted)
          : validators[validatorFn](valueField[validatorFn])(valueFormatted)

      if (error) {
        errors.push(error)
      }

      return validatorFn
    })

  if (
    errors.length === 0 &&
    fieldName === 'submission.articleURL' &&
    doiValidation
  ) {
    return client
      .query({
        query: VALIDATE_DOI,
        variables: {
          articleURL: value,
        },
      })
      .then(res => {
        if (!res.data.validateDOI.isDOIValid) {
          return 'DOI is invalid'
        }

        return undefined
      })
  }

  return errors.length > 0 ? errors[0] : undefined
}

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
  createSupplementaryFile,
  onChange,
  onSubmit,
  submitSubmission,
  errors,
  validateForm,
  match,
}) => {
  const client = useApolloClient()

  const submitButton = (text, haspopup = false) => {
    return (
      <div>
        <Button
          onClick={async () => {
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

  const submitButtonText = match.url.includes('/evaluation')
    ? 'Submit Evaluation'
    : 'Submit your research object'

  const hasPopup = form.haspopup ? JSON.parse(form.haspopup) : false
  return (
    <Container>
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
        {(form.children || []).map((element, i) => {
          return (
            <Section
              cssOverrides={JSON.parse(element.sectioncss || '{}')}
              key={`${element.id}`}
            >
              <Legend dangerouslySetInnerHTML={createMarkup(element.title)} />
              {element.component === 'SupplementaryFiles' && (
                <FilesUpload
                  containerId={manuscript.id}
                  containerName="manuscript"
                  fileType="supplementary"
                  onChange={onChange}
                />
              )}
              {element.component === 'VisualAbstract' && (
                <FilesUpload
                  accept="image/*"
                  containerId={manuscript.id}
                  containerName="manuscript"
                  fileType="visualAbstract"
                  multiple={false}
                  onChange={onChange}
                />
              )}
              {element.component === 'AuthorsInput' && (
                <AuthorsInput data-testid={element.name} onChange={onChange} />
              )}
              {element.component !== 'AuthorsInput' &&
                element.component !== 'SupplementaryFiles' &&
                element.component !== 'VisualAbstract' && (
                  <ValidatedFieldFormik
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

                      setFieldValue(element.name, val, true)
                      onChange(val, element.name)
                    }}
                    readonly={false}
                    setTouched={setTouched}
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
                      'order',
                    ])}
                    validate={composeValidate(
                      element.validate,
                      element.validateValue,
                      element.name,
                      JSON.parse(
                        element.DoiValidation ? element.DoiValidation : false,
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

        {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) &&
          !['submitted', 'revise'].includes(values.status) &&
          submitButton(submitButtonText, hasPopup)}

        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
          !['revise'].includes(values.status) &&
          submitButton(submitButtonText, hasPopup)}

        {values.status === 'revise' && submitButton(submitButtonText)}

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
        order: PropTypes.string, // number as string
        placeholder: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.object.isRequired),
        validateValue: PropTypes.objectOf(
          PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired,
          ]).isRequired,
        ),
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
  }).isRequired,
  setTouched: PropTypes.func.isRequired,
  values: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
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
  submitSubmission: PropTypes.func,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
  validateForm: PropTypes.func.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
}
FormTemplate.defaultProps = {
  journal: undefined,
  onSubmit: undefined,
  submitSubmission: undefined,
  createSupplementaryFile: undefined,
}

export default FormTemplate
