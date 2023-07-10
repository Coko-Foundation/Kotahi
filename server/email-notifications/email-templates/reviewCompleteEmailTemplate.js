const ReviewCompleteEmailTemplate = (
  { articleTitle, receiverName, shortId },
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
      result.subject = 'Aperture Neuro – Review Process Complete'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>I am pleased to report that Aperture Submission "${articleTitle}" has completed the Peer-Review phase. The next step is to make a recommendation to the Editor-in-Chief based on your personal assessment of the work and the feedback received from the Peer-Reviewers.</p>
      <p>To access the submission please log onto the Aperture Submission Kotahi platform at <a href="https://apertureneuro.cloud68.co/login" target="_blank">https://apertureneuro.cloud68.co/login</a>. Please make your final recommendation using the Chat Feature.</p>
      <p>Thank you,</p>
      <p>Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    default:
      result.subject = 'Review Process Complete'
      result.content = `<p>
      <p>Dear ${receiverName},</p>
      <p>I am pleased to report that Submission "${articleTitle}" has completed the Peer-Review phase. The next step is to make a recommendation to the Editor-in-Chief based on your personal assessment of the work and the feedback received from the Peer-Reviewers.</p>
      <p>To access the submission please log onto the Kotahi platform at <a href="https://kotahidev.cloud68.co/login" target="_blank">https://kotahidev.cloud68.co/login</a>. Please make your final recommendation using the Chat Feature.</p>
      <p>Thank you,</p>
      <p>Kotahi Dev</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewCompleteEmailTemplate
