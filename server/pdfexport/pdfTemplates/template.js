// this could probably be better done with nunjucks or something similar?
// possible issue: this doesn't check that what's coming in doesn't have an HTML wrapper

/* fields (from https://gitlab.coko.foundation/kotahi/kotahi/-/issues/774 ):

metadata:
	title (string)
	topics (array of string)
	author (Name)
	doi (string/url)
	abstract (string/html)
	editorsEvaluation (string/html)
	AuthorCorrespondence (string/html)
	competingInterests (string/html)
	funding (string/html)
	authorContributions (string/html)
	authorOrcids (list of strings? should this be part of Author?)
	decideLetterAndAuthorResponse (string/html)
	supplementaryFiles (list of urls)
	dataAvailability (string/html)
	references (string/html)
	dateReceived (date)
	dateAccepted (date)
	datePublished (date)
	reviewingEditorsName (Name)
	copyright (string)

	Name:
		firstName (string)
		lastName (string)
		affiliation (string)
		email (string/email)

*/

const cleanDate = date =>
  date &&
  new Date(date).toLocaleString('en-US', {
    timeZone: 'America/New_York', // TODO: make time zone / method of spelling out date configurable
  })

const makeTemplate = (content, metadata) => {
  const {
    title,
    doi,
    authors,
    abstract,
    contact,
    affiliation,
    topics,
    datePublished,
    dateAccepted,
    dateReceived,
  } = metadata

  const cleanedDatePublished = cleanDate(datePublished)
  const cleanedDateAccepted = cleanDate(dateAccepted)
  const cleanedDateReceived = cleanDate(dateReceived)

  const authorSection = `<h2>${authors
    .map(
      author =>
        `${author.firstName} ${author.lastName} (${author.affiliation}) <${author.email}>`,
    )
    .join(', ')}</h2>`

  return `<!DOCTYPE html>
<html>
  <head>
		<meta charset="UTF-8">
    <title>${title || 'This is the title'}</title>
  </head>
  <body>
		<section style="border: 1px solid black;padding:1em;color:white;background-color:black;">
		<h1>${title}</h1>
		<p>DOI: ${doi}</p>
		${authorSection}
		<h3>${affiliation}, ${contact}</h3>
		<h3>Topics: ${topics}</h3>
		<h3>Date received: ${cleanedDateReceived}</h3>
		<h3>Date accepted: ${cleanedDateAccepted}</h3>
		<h3>Date published: ${cleanedDatePublished}</h3>
		<div><h3>Abstract</h3>${abstract}</div>
		</section>
    <article>${content}</article>
  </body>
</html>`
}

module.exports = makeTemplate
