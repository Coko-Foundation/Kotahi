const ReviewerInvitationEmailTemplate = ({
  articleTitle,
  appUrl,
  invitationId,
  receiverName,
  currentUser,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi | Reviewer invitation ',
    content: '',
  }

  result.content = `
  	<p>
		<p>Dear ${receiverName}</p>
		<p>
			You have been selected to peer review the manuscript titled “${articleTitle}”. Click on the link below to accept or decline the invitation;
		</p>
		<p>
			<a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a>
		</p>
		<p>
			<a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a>

		<p>
			I look forward to hearing from you.
		</p>

		<p>
			Best regards <br>
			${currentUser}
		</p>

		<p>
			On behalf of Biophysics Colab <br>
			<a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
		</p>

		<h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>

		<p>
		  After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
		</p>

		<p>Once logged in, please click on ‘do review’ for the appropriate preprint on your dashboard to access the review form.</p>

		<p>Note that you can log in to our platform at any time by visiting<br>

		<a href="https://biophysics-sciencecolab.kotahi.cloud/login" target="_blank">https://biophysics-sciencecolab.kotahi.cloud/login</a>
		</p>`

  result.content = result.content.replace(/\s+/g, ' ')

  return result
}

module.exports = ReviewerInvitationEmailTemplate
