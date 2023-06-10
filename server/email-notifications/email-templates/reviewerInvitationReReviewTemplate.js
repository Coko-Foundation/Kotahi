const ReviewerInvitationReReviewTemplate = ({
  receiverName,
  currentUser,
  appUrl,
  articleTitle,
  submissionLink,
  invitationId,
  manuscriptPageUrl,
  ccEmails = [],
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = `lesley@sciencecolab.org, swartzk@ninds.nih.gov`

  if (ccEmails.length) {
    const ccEmailRecipients = ccEmails.join(', ')
    result.cc += `, ${ccEmailRecipients}`
  }

  result.subject = 'Request to review a revised preprint for Biophysics Colab'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>Thank you for sharing your time and expertise during your recent review of the preprint “${articleTitle}”.</p>
      <p>After carefully considering our advice, the authors have published a revised preprint in bioRxiv (which is available at <a href="${submissionLink}" target="_blank">${articleTitle}</a>) and submitted a response to the various comments in our report: ${manuscriptPageUrl}</p>
      <p>I’d be interested to hear your thoughts on the appropriateness of the authors’ response and whether you feel the conclusions in the revised preprint are robust and therefore suitable for endorsement by Biophysics Colab. I’d be grateful if you could indicate your willingness to re-review this work by accepting our invitation using the link below.</p>
      <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
      <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
      <p>After considering the revisions, please complete the relevant fields in the review form by selecting ‘do review’.</p>
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
