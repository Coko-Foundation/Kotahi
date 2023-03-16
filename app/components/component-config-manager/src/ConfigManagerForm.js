/* eslint-disable no-unused-vars */
import React from 'react'
import Form from '@rjsf/core'
import { schema, uiSchema } from './ui/schema'
import {
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  PaddedContent,
  SectionContent,
  WidthLimiter,
} from '../../shared'

const FieldTemplate = props => {
  const { classNames, description, children } = props
  return (
    <div className={classNames}>
      {description}
      {children}
    </div>
  )
}

const ConfigManagerForm = ({
  configId,
  disabled,
  formData,
  liveValidate = true,
  omitExtraData = true,
  updateConfig,
  updateConfigStatus,
}) => {
  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <Container>
        <HeadingWithAction>
          <Heading>Configuration</Heading>
        </HeadingWithAction>
        <WidthLimiter>
          <SectionContent>
            <PaddedContent>
              <Form
                disabled={disabled}
                FieldTemplate={FieldTemplate}
                formData={formData}
                liveValidate={liveValidate}
                noHtml5Validate
                omitExtraData={omitExtraData}
                onSubmit={values => updateConfig(configId, values.formData)}
                schema={schema}
                uiSchema={uiSchema}
              >
                <ActionButton
                  disabled={disabled}
                  primary
                  status={updateConfigStatus}
                  type="submit"
                >
                  Submit
                </ActionButton>
              </Form>
            </PaddedContent>
          </SectionContent>
        </WidthLimiter>
      </Container>
    </>
  )
}

export default ConfigManagerForm
