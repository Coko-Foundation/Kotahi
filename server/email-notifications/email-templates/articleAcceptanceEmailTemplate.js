const ArticleAcceptanceEmailTemplate = ({
  articleTitle,
  link,
  receiverFirstName,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notification Email',
    content: `<p>
        <b>Dear ${receiverFirstName},</b>
        <br>
        <br>
        <p>${articleTitle} has been selected for review by Biophysics CoLab. Click on the link below to accept and access your article submission on our peer review platform.</p>
        <br>
        <br>
        <a href=${link} target="_blank">Insert magic link</a>
        <br>
        <br>
        <p><b>Please note;</b> you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2mins to <a href="https://orcid.org/register" target="_blank">register an ORCID new account here</a>.</p>
        <br>
        <br>
        <p>
        Thanks, <br>
        Biophysics CoLab team
        </p>
    </p>`,
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ArticleAcceptanceEmailTemplate
