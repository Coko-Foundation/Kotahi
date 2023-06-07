const ReminderAuthorInvitationTemplate = ({
  articleTitle,
  appUrl,
  currentUser,
  invitationId,
  receiverName,
  ccEmails = [],
}) => {
  const result = {}

  result.cc = `lesley@sciencecolab.org, swartzk@ninds.nih.gov`

  if (ccEmails.length) {
    const ccEmailRecipients = ccEmails.join(', ')
    result.cc += `, ${ccEmailRecipients}`
  }

  result.subject =
    'Reminder: Interest in your preprint from Biophysics Colab (in partnership with eLife)'
  result.content = `
    <p>Dear ${receiverName}</p>
 
    <p>I hope you’ve had an opportunity to consider our request to provide free peer review of your recent preprint “${articleTitle}”.</p>
     
    <p>We understand that our new and innovative service might require additional introduction and therefore encourage you to find out more by visiting our <a href="https://www.sciencecolab.org/biophysics-colab">website</a>. We’d also be happy to arrange a video call at your convenience to answer any questions. Simply email <a href="mailto:https://www.sciencecolab.org/biophysics-colab">lesley@sciencecolab.org</a> to arrange this.</p>
     
    <p>If you would like to receive expert feedback on your preprint, please accept our invitation using the link below. If not, we’d be grateful if you let us know via the decline link.</p>

    <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
    <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>

    <p>I look forward to hearing from you.</p>

    <p>Best regards <br>
    ${currentUser}
    </p>

    <p>
    On behalf of Biophysics Colab <br>
    <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p>
    
    <h3 style="margin-bottom: 2px;">Instructions for authors</h3>
    <p>After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>.<br></p>
    <p>Once logged in, please click on the name of the preprint on your dashboard, complete the submission information, then select ‘submit your research object’.</p>
    <p>Note that you can log in to our platform at any time by visiting<br>
    <a href="https://biophysics-sciencecolab.kotahi.cloud/login" target="_blank">https://biophysics-sciencecolab.kotahi.cloud/login</a>
    </p>`

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReminderAuthorInvitationTemplate
