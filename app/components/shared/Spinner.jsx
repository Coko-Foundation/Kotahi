import React from 'react'
import styled from 'styled-components'
import { rotate360, th } from '@pubsweet/ui-toolkit'

// Courtesy of loading.io/css
const Spinner = styled.div`
  display: inline-block;
  height: 64px;
  width: 64px;

  &:after {
    animation: ${rotate360} 1s linear infinite;
    border: 5px solid ${th('colorPrimary')};
    border-color: ${th('colorPrimary')} transparent ${th('colorPrimary')}
      transparent;
    border-radius: 50%;
    content: ' ';
    display: block;
    height: 46px;
    margin: 1px;
    width: 46px;
  }
`

const LoadingPage = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding-bottom: calc(${th('gridUnit')} * 2);
`

export default () => (
  <LoadingPage>
    <Spinner />
  </LoadingPage>
)
