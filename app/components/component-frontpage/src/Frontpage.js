import React, { useContext } from 'react'
import { useQuery } from '@apollo/client'
import { JournalContext } from '../../xpub-journal/src'
import queries from './queries'
import { Container, Placeholder } from './style'

import {
  Spinner,
  SectionHeader,
  Title,
  SectionRow,
  SectionContent,
  Heading,
  HeadingWithAction,
} from '../../shared'

const Frontpage = ({ history, ...props }) => {
  const { loading, data, error } = useQuery(queries.frontpage)
  const journal = useContext(JournalContext)
  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const frontpage = (data.publishedManuscripts?.manuscripts || []).map(m => ({
    ...m,
    submission: JSON.parse(m.submission),
  }))

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Recent publications in {journal.metadata.name}</Heading>
      </HeadingWithAction>
      {frontpage.length > 0 ? (
        frontpage.map(manuscript => (
          <SectionContent>
            <SectionHeader>
              <Title>{manuscript.meta.title}</Title>
            </SectionHeader>
            <SectionRow key={`manuscript-${manuscript.id}`}>
              <p>
                {manuscript.submitter.defaultIdentity.name} (
                {manuscript.submission.affiliation})
              </p>
              <div>
                Submitted files:
                {manuscript.files.map(file => (
                  <p>
                    <a
                      href={file.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {file.filename}
                    </a>
                  </p>
                ))}
              </div>
              <div>
                Submitted research objects:
                {manuscript.submission?.links?.map(link => (
                  <p>
                    <a
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.url}
                    </a>
                  </p>
                ))}
              </div>
              <div>
                Reviews:
                {manuscript.reviews.map(
                  review =>
                    review.reviewComment && (
                      <p>&quot;{review.reviewComment?.content}&quot;</p>
                    ),
                )}
              </div>
              <div>Published: {manuscript.published}</div>
            </SectionRow>
          </SectionContent>
        ))
      ) : (
        <Placeholder>No submissions have been published yet.</Placeholder>
      )}
    </Container>
  )
}
export default Frontpage
