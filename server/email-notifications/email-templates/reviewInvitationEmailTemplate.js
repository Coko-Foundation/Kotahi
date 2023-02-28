const ReviewInvitationEmailTemplate = ({
  appUrl,
  articleTitle,
  authorName,
  currentUser,
  instance,
  invitationId,
  receiverName,
  shortId,
  submissionLink,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (instance) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Aperture Neuro Peer-Reviewer Invitation Email'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>I am writing to invite you to peer-review a new submission for Aperture Neuro, a new open access publishing platform powered by the Organization for Human Brain Mapping. I would like to invite you to review the following Research Object:</p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>If you are interested in reviewing this submission, please complete the following:</p>
      <ol>
        <li>Complete this Survey at <a href="https://www.surveymonkey.com/r/ApertureInvite" target="_blank">https://www.surveymonkey.com/r/ApertureInvite</a> indicating whether you accept the review.</li>
        <li>Log into <a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a> with your Orcid ID and set up your profile. Once your profile is set up, you will receive a notification that the submission is ready to review.</li>
      </ol>
      <p>If you have questions about Aperture, the review process, or the submission, please contact the journal manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
      <p>Thank you,</p>
      <p>Handling Editor <br>
      Aperture Neuro
      </p>
    </p>`
      break
    case 'colab':
      result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
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

        <p>Please note that you will require an ORCID account in order to log in to our platform. If you don’t already have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>.</p>

        <p>I look forward to hearing from you.</p>

        <p>
        Best regards <br />
        ${currentUser}
        </p>

        <p>
          On behalf of Biophysics Colab <br />
          <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
        </p>

        <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>
        <p style="margin-top: 2px;">Our primary goal is to deliver objective feedback on published preprints that is independent of the criteria applied by conventional journals. Our reports detail three types of recommendation: revisions that we consider to be essential for the results to support the conclusions; optional suggestions for the authors to consider; and minor corrections or presentational issues (see below). All these recommendations should help to strengthen the manuscript, but authors can decide which advice to follow. If a revised preprint addresses the revisions that we define as essential, we offer to publicly endorse the work.<br /> <br />
          <u>General assessment</u>: <br />
          Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
          &nbsp;&nbsp; -   	The objectives of the study <br />
          &nbsp;&nbsp; -   	Key findings and major conclusions <br />
          &nbsp;&nbsp; -   	Your opinion of its strengths and weaknesses <br /> <br />
          <u>Recommendations</u>: <br />
          Please list your recommendations for improving the rigour and credibility of the work under the following three categories: <br />
          &nbsp;&nbsp; -   	Essential revisions <br />
          &nbsp;&nbsp; -   	Optional suggestions <br />
          &nbsp;&nbsp; -   	Minor and presentational issues <br /> <br />
          <u>Your relevant expertise</u>: <br />
          Please succinctly state your relevant expertise (we will not reveal your name if you prefer to remain anonymous).
        </p>
      `
      break
    default:
      result.subject = 'Peer-Reviewer Invitation Email'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>I am writing to invite you to peer-review a new submission. I would like to invite you to review the following Research Object: </p>
      <p>“${shortId}; ${articleTitle}, ${authorName}”</p>
      <p>If you are interested in reviewing this submission, please log onto the <a href="https://kotahidev.cloud68.co/login" target="_blank">Kotahi</a> with your Orcid ID and set up your profile.</p>
      <p>Thank you,</p>
      <p>Handling Editor <br>
      Kotahi Dev
      </p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewInvitationEmailTemplate
