const AuthorAcceptanceEmailTemplate = ({
  articleTitle,
  appUrl,
  receiverFirstName,
  shortId,
  invitationId,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: `<p>
        Dear <b>${receiverFirstName},</b>
        <br>
        <br>
        <p><B><I>${articleTitle}</I></B> is said to have been written by you. Click on the link below to accept and access your article submission on our peer review platform. Alternatively, reject it if you wish.</p>
        <br>
        <br>
        <a href=${appUrl}/acceptarticle/${invitationId} target="_blank">Acceptance magic link</a>
        <br>
        <br>
        <a href=${appUrl}/decline/${invitationId} target="_blank">Rejection magic link</a>
        <br>
        <br>here is invitation id ${invitationId}
        <br>
        <p><b>Please note;</b> you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2mins to <a href="https://orcid.org/register" target="_blank">register an ORCID new account here</a>.</p>
        <br>
        <br>
        <p>
        Thanks, <br>
        Kotahi Team
        </p>
    </p>`,
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = AuthorAcceptanceEmailTemplate
