import { createGlobalStyle } from 'styled-components'

export default createGlobalStyle`
  html {
    overflow: hidden;
  }

  body {
    height: 100vh;
  }

  #root,
  #root > div {
    height: 100%;
  }
`
