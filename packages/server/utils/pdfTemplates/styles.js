const css = `
/* CSS for Paged.js interface – v0.2 */

/* Change the look */
:root {
    --color-background: whitesmoke;
    --color-pageSheet: #cfcfcf;
    --color-pageBox: violet;
    --color-paper: white;
    --color-marginBox: transparent;
    --pagedjs-crop-color: black;
    --pagedjs-crop-shadow: white;
    --pagedjs-crop-stroke: 1px;
}

/* To define how the book look on the screen: */
@media screen {
	.disclaimer {
		box-sizing: border-box;
		display: flex;
		height: 25%;
		border: 5px solid blue;
		justify-content: center;
		align-items: center;
		font-size: 24px;
		line-height: 36px;
		padding: 50px;
		margin: 100px;
	}
	/* section {
		display: none;
	} */

    body {
        background-color: var(--color-background);
    }

    .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;
    }

    .pagedjs_page {
        background-color: var(--color-paper);
        box-shadow: 0 0 0 1px var(--color-pageSheet);
        margin: 0;
        flex-shrink: 0;
        flex-grow: 0;
        margin-top: 10mm;
    }

    .pagedjs_first_page {
        margin-left: var(--pagedjs-width);
    }

    .pagedjs_page:last-of-type {
        margin-bottom: 10mm;
    }

    .pagedjs_pagebox{
        box-shadow: 0 0 0 1px var(--color-pageBox);
    }

    .pagedjs_left_page{
        z-index: 20;
        width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width))!important;
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
        border-color: transparent;
    }
    
    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle{
        width: 0;
    } 

    .pagedjs_right_page{
        z-index: 10;
        position: relative;
        left: calc(var(--pagedjs-bleed-left)*-1);
    }

    /* show the margin-box */

    .pagedjs_margin-top-left-corner-holder,
    .pagedjs_margin-top,
    .pagedjs_margin-top-left,
    .pagedjs_margin-top-center,
    .pagedjs_margin-top-right,
    .pagedjs_margin-top-right-corner-holder,
    .pagedjs_margin-bottom-left-corner-holder,
    .pagedjs_margin-bottom,
    .pagedjs_margin-bottom-left,
    .pagedjs_margin-bottom-center,
    .pagedjs_margin-bottom-right,
    .pagedjs_margin-bottom-right-corner-holder,
    .pagedjs_margin-right,
    .pagedjs_margin-right-top,
    .pagedjs_margin-right-middle,
    .pagedjs_margin-right-bottom,
    .pagedjs_margin-left,
    .pagedjs_margin-left-top,
    .pagedjs_margin-left-middle,
    .pagedjs_margin-left-bottom {
        box-shadow: 0 0 0 1px inset var(--color-marginBox);
    }

    /* uncomment this part for recto/verso book : ------------------------------------ */

    
     .pagedjs_pages { 
        flex-direction: column;
        width: 100%;
    }

    .pagedjs_first_page {
        margin-left: 0;
    }

    .pagedjs_page {
        margin: 0 auto;
        margin-top: 10mm;
    } 

    .pagedjs_left_page{
        width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width) + var(--pagedjs-bleed-left))!important;
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop{
        border-color: var(--pagedjs-crop-color);
    }

    .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle{
        width: var(--pagedjs-cross-size)!important;
    } 

    .pagedjs_right_page{
        left: 0; 
    }  
    
    
    

    /*--------------------------------------------------------------------------------------*/



    /* uncomment this par to see the baseline : -------------------------------------------*/

    
    /* .pagedjs_pagebox {
        --pagedjs-baseline: 22px;
        --pagedjs-baseline-position: 5px;
        --pagedjs-baseline-color: cyan;
        background: linear-gradient(transparent 0%, transparent calc(var(--pagedjs-baseline) - 1px), var(--pagedjs-baseline-color) calc(var(--pagedjs-baseline) - 1px), var(--pagedjs-baseline-color) var(--pagedjs-baseline)), transparent;
        background-size: 100% var(--pagedjs-baseline);
        background-repeat: repeat-y;
        background-position-y: var(--pagedjs-baseline-position);
    }  */
   

    /*--------------------------------------------------------------------------------------*/
}





/* Marks (to delete when merge in paged.js) */

.pagedjs_marks-crop{
    z-index: 999999999999;
  
}

.pagedjs_bleed-top .pagedjs_marks-crop, 
.pagedjs_bleed-bottom .pagedjs_marks-crop{
    box-shadow: 1px 0px 0px 0px var(--pagedjs-crop-shadow);
}  

.pagedjs_bleed-top .pagedjs_marks-crop:last-child,
.pagedjs_bleed-bottom .pagedjs_marks-crop:last-child{
    box-shadow: -1px 0px 0px 0px var(--pagedjs-crop-shadow);
}  

.pagedjs_bleed-left .pagedjs_marks-crop,
.pagedjs_bleed-right .pagedjs_marks-crop{
    box-shadow: 0px 1px 0px 0px var(--pagedjs-crop-shadow);
}

.pagedjs_bleed-left .pagedjs_marks-crop:last-child,
.pagedjs_bleed-right .pagedjs_marks-crop:last-child{
    box-shadow: 0px -1px 0px 0px var(--pagedjs-crop-shadow);
}

/* insert fonts */

@font-face {
  font-family: "Newsreader";
  src: url("./Newsreader-VariableFont-opsz-wght.ttf") format("truetype");
  /* src: url("/profiles/Newsreader-VariableFont-opsz-wght.ttf") format("truetype");  works with useHTML true */
  font-style: normal;
  font-weight: 300 700;
}

@font-face {
  font-family: "Newsreader";
  src: url("./Newsreader-Italic-VariableFont-opsz-wght.ttf") format("truetype");
  /* src: url("/profiles/Newsreader-Italic-VariableFont-opsz-wght.ttf") format("truetype");  works with useHTML true */
  font-style: italic;
  font-weight: 300 700;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

:root {
  --color-primary: #087acc;
  --color-secondary: #629f43;
  --color-title: #2a3b86;
  --color-heading2: #7c7a7a;
  --color-other-headings: initial;
  --content-font: "Newsreader";
  --heading-font: "Newsreader";
}

/* main css */

body {
  font-family: var(--content-font);
  font-weight: 300;
}
strong {
  font-weight: 500;
}

@page {
  size: letter;
  margin: 0.8in 0.5in 0.8in 3in;
  border-bottom: 0.5px solid rgb(148, 147, 147);
  @bottom-left {
    content: string(urlLocation);
    width: max-content;
    font-size: 8px;
    margin-bottom: auto;
  }
  @bottom-right {
    content: counter(page) " of " counter(pages);
    width: fit-content;
    margin-left: auto;
    font-size: 8px;
  }
}
@page: first {
  @top-right {
    content: " ";
  }
}
@media print {
	.disclaimer {
		display: none;
	}
  body {
    font-size: 12px;
    line-height: 22px;
  }
  h1,
  h2,
  h3,
  h4 {
    font-family: var(--heading-font);
    line-height: 1.1;
    break-after: avoid;
    margin-top: 2.2em;
    margin-bottom: 0.8em;
    font-weight: 500;
  }
  h1 + h2,
  h2 + h3,
  h3 + h4 {
    break-before: avoid;
    margin-top: 1.3rem;
  }
  p {
    text-align: justify;
    hyphens: auto;
    widows: var(--widows);
    orphans: var(--orphans);
  }
  p + p,
  ol + p,
  ul + p,
  .marginData section + section {
    margin-top: 22px;
  }
  header {
    margin-top: 3em;
  }
  h1 {
    color: var(--color-title);
    font-size: 2.3em;
    font-weight: 800;
    margin-top: 0.8em;
  }
  h2 {
    font-size: 1.77em;
  }
  h3 {
    font-size: 1.33em;
  }
  h2,
  h2 > a:link,
  h2 > a:visited {
    color: var(--color-heading2);
  }
  h3,
  h4 {
    color: var(--color-other-headings);
  }
  a:link,
  a:visited {
    color: var(--color-primary);
    text-decoration: none;
  }
  .authors-list li,
  .affiliations-list li {
    display: inline;
  }

  .authors-list li {
    font-weight: 700;
    color: var(--color-title);
  }

  .authors-list li small {
    font-weight: 400;
    color: black;
  }

  /* li{
    display: inline;
  } */
  aside.marginData.left {
    position: absolute;
    left: calc(var(--pagedjs-margin-left) * -1);
    bottom: 0;
    width: 2.5in;
    text-align: left;
    padding-left: 50px;
    line-height: 18px;
  }
  .marginData h4 {
    line-height: 15px;
    margin: 0;
  }
  sup {
    font-weight: 500;
    line-height: 0;
  }
  /* blockquote{
    border-left: 0.3ch;
    font-weight: 500
  } */
  aside.marginData.bottom {
    /* display: none; */
  }
  aside ul {
    padding-left: 30px;
  }

  .titlepage aside.marginData.top {
    string-set: researchLevel content();
    /* display: none; */
  }
  .content aside.marginData.top {
    string-set: topics content();
    /* display: none; */
  }

  .url {
    string-set: urlLocation content();
  }
  aside h4,
  aside p {
    display: inline;
  }
  aside h4,
  sup {
    font-weight: 500;
  }

  aside {
    font-variation-settings: "opsz" 6;
    font-size: 0.8em;
  }

  table {
    border-collapse: collapse;
    text-align: left;
    /* break-inside: avoid; */
  }

	tr {
		break-inside: avoid;
	}

  td,
  th {
    padding: 2px;
    font-weight: 500;
  }
  td p,
  th p {
    text-align: left;
  }
  tr {
    border-bottom: 0.5px solid var(--color-heading2);
  }
  content > figure {
    margin-left: calc(var(--pagedjs-margin-left) * -0.5);
    margin-right: calc(var(--pagedjs-margin-right) * -0.5);
  }
  .figure img {
    margin: 15px auto;
    width: 100%;
  }

  ul,
  ol {
    list-style: none;
  }
}
/*  to align the running heads*/
.pagedjs_margin.hasContent {
  height: 100%;
}

figure img {
  width: 100%;
  height: auto;
}

figure {
  break-inside: avoid;
  padding: 1em;
  border: 1px solid black;
}

figure figcaption {
  font-size: 0.8em;
  line-height: 1.5;
  column-count: 2;
}
figure[data-split-to] {
  border-bottom: none;
}
figure[data-split-from] {
  border-top: none;
}

.topic-list {
  list-style-type: none;
}
header {
  color: var(--color-title);
}
.logo {
  position: absolute;
  left: calc((var(--pagedjs-margin-left) * -1) + 49px);
  top: 0;
}
.copyright {
  string-set: copyright content();
}

.licence svg {
  max-width: 80px;
}


/* Remove duplicate title from print page */
.content h1:first-of-type{
  display: none;
}


section.frontmatter, section.abstractSection {
  display: none;
}

/* FIXES */
@media print {

	.content ul, .content ol {
		padding-left: 30px;
	}

	.content ul {
		list-style-type: disc;
	}

	.content ol {
		list-style-type: decimal;
	}

	figure img {
		max-width: 100%;
	}

	figure {
		max-width: 100%;
	}

	td, th {
		font-weight: 300;
  }
}
`

module.exports = css
