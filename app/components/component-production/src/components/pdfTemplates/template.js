// this could probably be better done serverside with nunjucks or something similar?
// possible issue: this doesn't check that what's coming in doesn't have an HTML wrapper

const makeTemplate = (content, metadata) => {
  const { title, author, contact, affiliation, keywords, pubDate } = metadata

  const cleanedDate = new Date(pubDate).toLocaleString('en-US', {
    timeZone: 'America/New_York',
  })

  return `<!DOCTYPE html>
<html>
  <head>
		<meta charset="UTF-8">
    <title>${title || 'This is the title'}</title>
  </head>
  <body>
		<section style="border: 1px solid black;padding:1em;color:white;background-color:black;">
		<h1>${title}</h1>
		<h2>${author}</h2>
		<h3>${affiliation}, ${contact}</h3>
		<h3>Key words: ${keywords}</h3>
		<h3>Publication date: ${cleanedDate}</h3>
		</section>
    <article>${content}</article>
  </body>
</html>`
}

export default makeTemplate
