const ReviewInvitationEmailTemplate = (
  { articleTitle, authorName, receiverName, shortId },
  instanceName,
) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (instanceName) {
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
      <p>Mallar Chakravarty</p>
      <p>Handling Editor <br>
      Aperture Neuro
      </p>
    </p>`
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
