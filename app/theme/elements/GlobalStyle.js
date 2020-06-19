import { createGlobalStyle } from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export default createGlobalStyle`


html {
display: flex;
min-height: 100%;
width: 100%;
box-sizing: border-box;
overflow: hidden;
}

body {
box-sizing: border-box;
height: 100%;
width: 100%;
overscroll-behavior-y: none;
background-color: ${th('colorBackground')};
font-family: ${th('fontInterface')}, sans-serif;
font-size: ${th('fontSizeBase')};
color: ${th('colorText')};
line-height: ${th('lineHeightBase')};
}
#root {
height: 100%
width: 100%
}

* {
border: 0;
box-sizing: inherit;
-webkit-font-smoothing: auto;
font-weight: inherit;
margin: 0;
outline: 0;
padding: 0;
text-decoration: none;
text-rendering: optimizeLegibility;
-webkit-appearance: none;
-moz-appearance: none;
}

`
