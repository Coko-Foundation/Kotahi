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
		  </p>
		  <p>
			  Your invitation id is ‘${invitationId}’<br>
			  Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
		  </p>
		  <p>
			  Regards, <br>
			  Kotahi team 
		  </p>
	  </p>
	  `

  result.content = result.content.replace(/\s+/g, ' ')

  return result
}

module.exports = ReviewerInvitationEmailTemplate
