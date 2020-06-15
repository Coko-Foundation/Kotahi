import { createGlobalStyle } from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export default createGlobalStyle`
/* http://meyerweb.com/eric/tools/css/reset/
v4.0 | 20180602
License: none (public domain)
*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
main, menu, nav, output, ruby, section, summary,
time, mark, audio, video {
margin: 0;
padding: 0;
border: 0;
font-size: 100%;
font: inherit;
vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, main, menu, nav, section {
display: block;
}
/* HTML5 hidden-attribute fix for newer browsers */
*[hidden] {
  display: none;
}
body {
line-height: 1;
}
ol, ul {
list-style: none;
}
blockquote, q {
quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
content: '';
content: none;
}
table {
border-collapse: collapse;
border-spacing: 0;
}

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
