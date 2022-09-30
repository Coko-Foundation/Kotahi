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
     
        <p>I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists who are working in partnership with eLife to improve the way that research papers, and by extension researchers, are evaluated. We are leveraging the knowledge and expertise of the global biophysics community to provide constructive feedback on publicly available preprints so that researchers can form the best possible interpretation of their data. In time, we will develop a publishing platform that will allow us to curate rigorous and robust studies in the form of journal articles. However, our first step is to offer a free peer review service for preprints that represent quantitative studies of physicochemical mechanisms underlying physiological processes.</p>
         
        <p>We are currently reviewing the recent preprint by ${authorName} and colleagues (<a href="${submissionLink}">${submissionLink}</a>), following the authors’ approval. Providing you have no potential conflicts of interest, which would include reviewing this work for a traditional journal, we’re hoping you might be available to review it for Biophysics Colab within the next two weeks. We would ask you to follow the guidelines below when writing your individual report and participate in a discussion to consolidate the various feedback we receive into a single report. With the authors’ permission, we will post this consolidated feedback on their bioRxiv publication, and highlight the work and our feedback on eLife’s <a href="https://www.sciety.org/groups/biophysics-colab" target="_blank">Sciety</a> platform. </p>
         
        <p>We would not publish your individual report and your name would only be associated with the feedback if you agree to sign the consolidated report. However, the collaborative nature of peer review at Biophysics Colab would involve your identity being revealed to the other reviewers.</p>
         
        <p>Would you be able to review this preprint for Biophysics Colab? If so, please accept our invitation using the link below. If you need longer than two weeks, or have any questions about this request, please feel free to discuss with Lesley Anson (<a href="mailto:lesley@sciencecolab.org">lesley@sciencecolab.org</a>). If you’re unavailable, we’d be grateful if you let us know via the decline link, which will present a feedback field where you can suggest alternative reviewers, such as postdoctoral scientists in your lab.</p>
         
        <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
        <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>

        <p>Please note that you will require an ORCID account in order to log in. If you don’t already have an ORCID, it takes two minutes to register one <a href="https://orcid.org/register" target="_blank">here</a>.</p>

        <p>Your invitation id is ‘${invitationId}’</p>
         
        <p>I look forward to hearing from you.</p>
         
        <p>
        Best regards <br />
        ${currentUser}
        </p>
         
        <p>
          On behalf of Biophysics Colab <br />
          <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
        </p>

        <p>Instructions for reviewers</p>
        <p>
        Our primary goal is to provide a service for authors by delivering objective feedback that is independent of the criteria applied by conventional journals, but which provides recommendations to strengthen the interpretation of the data. The collaborative process, which borrows heavily from that used at eLife, will involve a video or email discussion to agree upon a consolidated report. <br />
          <u>General assessment</u>: <br />
          Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
          -   	The objectives of the study <br />
          -   	Key findings and major conclusions <br />
          -   	Your opinion of its strengths and weaknesses <br />
          <u>Recommendations</u>: <br />
          Please list your recommendations for improving the rigour and credibility of the work under the following three categories: <br />
          -   	Revisions essential for your endorsement <br />
          -   	Additional suggestions for the authors to consider <br />
          -   	Minor corrections and presentational issues <br />
          <u>Your relevant expertise</u>: <br />
          Please succinctly state your relevant expertise (your name will be revealed if you give us permission to do so).
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
