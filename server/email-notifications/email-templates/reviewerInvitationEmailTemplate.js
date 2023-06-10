const ReviewerInvitationEmailTemplate = ({
  appUrl,
  articleTitle,
  authorName,
  currentUser,
  instance,
  invitationId,
  receiverName,
  submissionLink,
  ccEmails = [],
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (instance) {
    case 'colab':
      result.cc = `lesley@sciencecolab.org, swartzk@ninds.nih.gov`

      if (ccEmails.length) {
        const ccEmailRecipients = ccEmails.join(', ')
        result.cc += `, ${ccEmailRecipients}`
      }

      result.subject =
        'Opportunity to review for Biophysics Colab (in partnership with eLife)'
      result.content = `
        <p>Dear ${receiverName}</p>

        <p>I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.</p>

        <p>We are currently reviewing the recent preprint by ${authorName} and colleagues (<a href="${submissionLink}">${articleTitle}</a>), following the authors’ approval. Providing you have no potential conflicts of interest, which might include reviewing this work for a traditional journal, we’re hoping you’ll be available to review the preprint for Biophysics Colab within the next two weeks. We would ask you to follow the guidelines below when formulating your feedback then participate in a discussion with the other reviewers to consolidate the various advice into a single report. With the authors’ permission, we will post this consolidated feedback on their bioRxiv publication, and highlight the work and our feedback on eLife’s <a href="https://www.sciety.org/groups/biophysics-colab" target="_blank">Sciety</a> platform.</p>

        <p>We would not publish your individual report and your name would only be associated with the feedback if you agree to sign the consolidated report. However, we are encouraged that 96% of our reviewers have chosen to reveal their identities, as is evident in <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a>. Please also bear in mind that the collaborative nature of peer review at Biophysics Colab would involve your identity being revealed to the other reviewers.</p>

        <p>Would you be able to review this preprint for Biophysics Colab? If so, please accept our invitation using the link below. If you need longer than two weeks, or have any questions about this request, please feel free to contact Lesley Anson (<a href="mailto:lesley@sciencecolab.org">lesley@sciencecolab.org</a>). If you’re unavailable, we’d be grateful if you let us know via the decline link, which will present a feedback field where you can suggest alternative reviewers such as postdoctoral scientists in your lab.</p>

        <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
        <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
        <p>
        I look forward to hearing from you.
      </p>

      <p>
        Best regards <br>
        ${currentUser}
      </p>

      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      </p>

      <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>

      <p>
      After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
      </p>

      <p>Once logged in, please click on ‘do review’ for the appropriate preprint on your dashboard to access the review form.</p>

      <p>Note that you can log in to our platform at any time by visiting<br>

       <a href="https://biophysics-sciencecolab.kotahi.cloud/login" target="_blank">https://biophysics-sciencecolab.kotahi.cloud/login</a>
      </p>
      `
      break
    default:
      result.subject = 'Kotahi | Reviewer invitation'
      result.content = `
          <p>
            <p>Dear ${receiverName}</p>
            <p>
                You have been selected to peer review the manuscript titled “${articleTitle}”. Click on the link below to accept or decline the invitation;
            </p>
            <p>
                <a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a>
            </p>
            <p>
                <a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a>
            </p>
            <p>
                Your invitation id is ‘${invitationId}’<br>
                Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
            </p>
            <p>
                Regards, <br>
                Kotahi team
            </p>
        </p>
        `
      break
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewerInvitationEmailTemplate
