const ReviewInvitationEmailTemplate = ({
  articleTitle,
  link,
  receiverFirstName,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (process.env.INSTANCE_NAME) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Peer-Reviewer Invitation Email'
      result.content = `<p>
      <b>Hello ${receiverFirstName},</b>
      <br>
      <br>
      <p>I am writing to invite you to peer-review a new submission for Aperture Neuro, a new open access publishing platform powered by the Organization for Human Brain Mapping. I would like to invite you to review the following Research Object: </p>
      <br>
      <p>${articleTitle}</p>
      <br>
      <p>If you are interested in reviewing this submission, please log onto the <a href="https://aperturedev.cloud68.co/login" target="_blank">Aperture Neuro Submission Platform</a> with your Orcid ID and set up your profile.</p>
      <p>Please follow up with me by sending a personal email letting me know you would like to review the work and have set up your profile.</p>
      <p>Once you are set up in the Aperture Neuro Publishing Platform you will be able to preview the submission and complete the review.</p>
      <p>After you agree to the review, we are asking that peer-reviewers complete their review within three-weeks upon acceptance of the review.</p>
      <p>For detailed instructions on peer-reviewing for Aperture Neuro, click here(insert link or PDF instructions for accessing Kotahi platform). </p>
      <p>If you have questions about Aperture, the review process, or the submission, please contact the journal manager at aperture@humanbrainmapping.org.</p>
      <br>
      <p>Thank you,</p>
    </p>`
      break
    default:
      result.subject = 'Peer-Reviewer Invitation Email'
      result.content = `<p>
      <b>Hello ${receiverFirstName},</b>
      <br>
      <br>
      <p>I am writing to invite you to peer-review a new submission. I would like to invite you to review the following Research Object: </p>
      <br>
      <p>${articleTitle}</p>
      <br>
      <p>If you are interested in reviewing this submission, please log onto the <a href="https://kotahidev.cloud68.co/login" target="_blank">Kotahi</a> with your Orcid ID and set up your profile.</p>
      <br>
     <p>Thank you,</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewInvitationEmailTemplate
