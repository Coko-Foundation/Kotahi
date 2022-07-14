import React from 'react'
import { FastField, ErrorMessage, useFormikContext } from 'formik'
import { get } from 'lodash'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

const MessageWrapper = styled.div`
  margin-top: ${grid(-2.5)};
  height: ${grid(2.5)};
  color: ${th('colorError')};
  display: flex;
  font-family: ${th('fontInterface')};

  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

// Based on https://github.com/jaredpalmer/formik/issues/146#issuecomment-474775723
const useFocusOnError = ({ fieldRef, name }) => {
  const formik = useFormikContext()
  const prevSubmitCountRef = React.useRef(formik.submitCount)
  let firstErrorKey = Object.keys(formik.errors)[0]
  // If the error is in a nested object, we need to look deeper
  // e.g. errors = { submission: { name: 'error' } }
  const nestedError = formik.errors[firstErrorKey]

  if (nestedError !== null && typeof nestedError === 'object') {
    firstErrorKey = `${firstErrorKey}.${Object.keys(nestedError)[0]}` // e.g. submission.name
  }

  React.useEffect(() => {
    if (prevSubmitCountRef.current !== formik.submitCount && !formik.isValid) {
      if (fieldRef.current && firstErrorKey === name) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        fieldRef.current.focus({ preventScroll: false })
      }
    }

    prevSubmitCountRef.current = formik.submitCount
  }, [formik.submitCount, formik.isValid, firstErrorKey])
}

const ValidatedField = ({ component: Component, ...props }) => {
  const fieldRef = React.useRef()
  const { name } = props
  useFocusOnError({ fieldRef, name })

  return (
    <FastField {...props}>
      {({ form: { errors, touched }, field, meta }) => {
        let validationStatus
        if (get(touched, name)) validationStatus = 'success'
        if (get(touched, name) && get(errors, name)) validationStatus = 'error'
        return (
          <div>
            <Component
              {...field}
              {...props}
              innerRefProp={fieldRef}
              validationStatus={validationStatus}
            />

            {/* live region DOM node must be initially present for changes to be announced */}
            <MessageWrapper role="alert">
              <ErrorMessage name={name} />
            </MessageWrapper>
          </div>
        )
      }}
    </FastField>
  )
}

export default ValidatedField
