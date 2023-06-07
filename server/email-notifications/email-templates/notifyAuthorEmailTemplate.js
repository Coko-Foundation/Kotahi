const NotifyAuthorEmailTemplate = ({
  manuscriptPageUrl,
  receiverName,
  currentUser,
  articleTitle,
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

  result.subject = 'Evaluation from Biophysics Colab'
  result.content = `<p>
    <p>Dear ${receiverName}</p>
    <p>Thank you for submitting your revised preprint “${articleTitle}” to Biophysics Colab for our further evaluation.</p>
    <p>Having now considered and discussed the work, we have drafted an evaluation statement that you can view at <a href="${manuscriptPageUrl}" target="_blank">${manuscriptPageUrl}</a>.</P>
    <p>Please let us know if you have any feedback on this statement. Otherwise, we will aim to post it on bioRxiv within the next week.</P>
    </P>Thank you for the opportunity to re-evaluate your study.</P
    <p>
    Best regards <br>
    ${currentUser}
    </p>
    <p>
    On behalf of Biophysics Colab <br>
    <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = NotifyAuthorEmailTemplate
