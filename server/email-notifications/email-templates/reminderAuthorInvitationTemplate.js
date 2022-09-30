const ReminderAuthorInvitationTemplate = ({
  articleTitle,
  appUrl,
  currentUser,
  invitationId,
  receiverName,
}) => {
  const result = {}

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject =
    'Reminder: Interest in your preprint from Biophysics Colab (in partnership with eLife)'
  result.content = `
    <p>Dear ${receiverName}</p>
 
    <p>I hope you’ve had an opportunity to consider our request to provide free peer review of your recent preprint “${articleTitle}”.</p>
     
    <p>We understand that our new and innovative service might require additional introduction and therefore encourage you to find out more by visiting our <a href="https://www.sciencecolab.org/biophysics-colab">website</a>. We’d also be happy to arrange a video call at your convenience to answer any questions. Simply email <a href="mailto:https://www.sciencecolab.org/biophysics-colab">lesley@sciencecolab.org</a> to arrange this.</p>
     
    <p>If you would like to receive expert feedback on your preprint, please accept our invitation using the link below. If not, we’d be grateful if you let us know via the decline link.</p>

    <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
    <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>

    <p>Please note that you will require an ORCID account in order to log in. If you don’t already have an ORCID, it takes two minutes to register one <a href="https://orcid.org/register" target="_blank">here.</a></p>

    <p>Your invitation ID is ‘${invitationId}’.</p>
     
    <p>I look forward to hearing from you.</p>
     
    <p>
      Best regards <br />
      ${currentUser}
    </p>
     
    <p>
      On behalf of Biophysics Colab <br />
      <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p>
  `

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReminderAuthorInvitationTemplate
