const ReviewCompleteEmailTemplate = ({
  articleTitle,
  receiverFirstName,
  shortId,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: '',
  }

  switch (process.env.INSTANCE_NAME) {
    case 'aperture':
      result.cc = 'aperture@humanbrainmapping.org'
      result.subject = 'Aperture Neuro – Review Process Complete'
      result.content = `<p>
      <p>Dear ${receiverFirstName},</p>
      <p>I am pleased to report that Aperture Submission "${articleTitle}" has completed the Peer-Review phase. The next step is to make a recommendation to the Editor-in-Chief based on your personal assessment of the work and the feedback received from the Peer-Reviewers.</p>
      <p>Thank you,</p>
      <p>Kay Vanda</p>
      <p>Journal Manager <br>
      Aperture Neuro
      </p>
    </p>`
      break
    default:
      result.subject = 'Review Process Complete'
      result.content = `<p>
      <p>Dear ${receiverFirstName},</p>
      <p>I am pleased to report that Submission "${articleTitle}" has completed the Peer-Review phase. The next step is to make a recommendation to the Editor-in-Chief based on your personal assessment of the work and the feedback received from the Peer-Reviewers.</p>
      <p>Thank you,</p>
      <p>Kotahi Dev</p>
    </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReviewCompleteEmailTemplate
