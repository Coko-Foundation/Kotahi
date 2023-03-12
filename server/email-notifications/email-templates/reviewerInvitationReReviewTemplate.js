const ReviewerInvitationReReviewTemplate = ({
  receiverName,
  currentUser,
  articleTitle,
  submissionLink,
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Request to review a revised preprint for Biophysics Colab'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>Thank you for sharing your time and expertise during your recent review of the preprint “${articleTitle}”.</p>
      <p>After carefully considering our advice, the authors have published a revised preprint in bioRxiv (which is available at ${submissionLink}) and submitted a response to the various comments in our report: <a href="${submissionLink}">${articleTitle}</a></p>
      <p>I’d be interested to hear your thoughts on the appropriateness of the authors’ response and whether you feel the conclusions in the revised preprint are robust and therefore suitable for endorsement by Biophysics Colab. I’d be grateful if you could convey your opinion by simply replying in the chat function: <a href="${submissionLink}">${articleTitle}</a></p>
      <p>Don’t hesitate to let me know if you’d like to discuss the revisions in a video call.</p>
      <p>Best regards<br/>${currentUser}</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = ReviewerInvitationReReviewTemplate
