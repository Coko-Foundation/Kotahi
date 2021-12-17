// this could probably be better done serverside with nunjucks or something similar?
// possible issue: this doesn't check that what's coming in doesn't have an HTML wrapper

const makeTemplate = (content, title) => `<!DOCTYPE html>
<html>
  <head>
		<meta charset="UTF-8">
    <title>${title || 'This is the title'}</title>
  </head>
  <body>
    ${content}
  </body>
</html>`

export default makeTemplate
