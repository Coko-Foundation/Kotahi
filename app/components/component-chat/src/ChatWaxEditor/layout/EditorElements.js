/* stylelint-disable selector-type-no-unknown */
import { css } from 'styled-components'
import { darken } from '@pubsweet/ui-toolkit'

/* All styles regarding ProseMirror surface and elements */

export default css`
  h1 {
    font-size: 1.75em;
    font-weight: 500;
    margin: 1em 0;
  }

  h2 {
    font-size: 1.625em;
    font-weight: 500;
    margin: 1em 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 500;
    margin: 1em 0;
  }

  h4 {
    font-size: 1.375em;
    font-weight: 500;
    margin: 1em 0;
  }

  h5 {
    font-size: 1.25em;
    font-weight: 500;
    margin: 1em 0;
  }

  h6 {
    font-size: 1.125em;
    font-weight: 500;
    margin: 1em 0;
  }

  /* JATS */

  section.frontmatter {
    background-color: rgba(255, 0, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'FRONT MATTER';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.abstractSection {
    background-color: rgba(255, 0, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'ABSTRACT';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.reflist {
    background-color: rgba(25, 25, 112, 0.25);
    border: 1px solid midnightblue;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'REFERENCE LIST';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }

    & p {
      &:before {
        content: '§ ';
      }
    }
  }

  h1.referenceheader {
    background-color: midnightblue;
    border-radius: 8px;
    color: white;
    padding: 4px 8px;
  }

  p.reference {
    &:before {
      content: '§ ';
    }
  }

  section.acknowledgementsSection {
    background-color: rgba(255, 255, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: black;
      content: 'ACKNOWLEDGEMENTS';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.appendix {
    background-color: rgba(0, 128, 128, 0.25);
    border: 1px solid teal;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'APPENDIX';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  h1.appendixheader {
    background-color: teal;
    border-radius: 8px;
    color: white;
    padding: 4px 8px;
  }

  /* added for figure weirdness */

  figure {
    border: 1px solid ${darken('colorPrimary', 1)};
    margin-bottom: 1rem;
    padding: 1rem;
    position: relative;
  }

  figure::before {
    color: ${darken('colorPrimary', 1)};
    content: 'Figure:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  figure:hover:before {
    content: 'Click to add a caption';
  }

  figcaption {
    border: 1px solid ${darken('colorPrimary', 1)};
    margin-top: 1rem;
    padding: 1rem;
    position: relative;
  }

  figcaption::before {
    color: ${darken('colorPrimary', 1)};
    content: 'Caption:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }
`
