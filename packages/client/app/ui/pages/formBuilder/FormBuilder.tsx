import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import CardGrid from '../../shared/CardGrid'
import Page from '../../shared/Page'
import PageDescription from '../../shared/PageDescription'

const FormBuilder = (): ReactNode => {
  const { groupName } = useParams()

  return (
    <Page title="Forms">
      <PageDescription>
        These are the forms authors, reviewers, and editors fill in at each
        stage of the manuscript workflow. Editing a form here changes what
        information gets collected from that point on, including which fields
        end up available as metadata elsewhere in Kotahi &mdash; it does not
        change data already submitted on existing manuscripts.
      </PageDescription>
      <CardGrid
        items={[
          {
            title: 'Submission Form',
            description:
              'Edit the form that authors will see when submitting a manuscript. Also affects the metadata fields available to editors and the data captured that will later be available for publishing.',
            url: `/${groupName}/admin/forms/submission-form-builder`,
            key: 'submission',
          },
          {
            title: 'Review Form',
            description:
              'Edit the form that reviewers will see when submitting a review on a manuscript.',
            url: `/${groupName}/admin/forms/review-form-builder`,
            key: 'review',
          },
          {
            title: 'Decision Form',
            description:
              'Edit the form that editors will see when making a decision on a manuscript.',
            url: `/${groupName}/admin/forms/decision-form-builder`,
            key: 'decision',
          },
        ]}
      />
    </Page>
  )
}

export default FormBuilder
