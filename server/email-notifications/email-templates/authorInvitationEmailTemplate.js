const AuthorInvitationEmailTemplate = ({
  articleTitle,
  appUrl,
  currentUser,
  invitationId,
  receiverName,
  instance,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notificaion Email',
    content: '',
  }

  switch (instance) {
    case 'colab':
      result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
      result.subject =
        'Interest in your preprint from Biophysics Colab (in partnership with eLife)'
      result.content = `<p>
          <p>Dear ${receiverName}</p>
          <p>
            I'm writing to tell you about a new project that I hope you’ll be interested in, and offer you an opportunity to get involved. 
          </p>
          <p>
            I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in <b>partnership with eLife</b> to improve the way that research papers, and by extension researchers, are evaluated. We are leveraging the knowledge and expertise of the global biophysics community to provide constructive and journal-agnostic feedback on preprints. In time, we will develop a platform that will allow us to curate rigorous and robust studies. However, our first step is to offer a <b>free peer review service</b> for preprints that represent quantitative studies of physicochemical mechanisms underlying physiological processes.
          </p>
          <p>
            We were interested to read your recent preprint “${articleTitle}” and would be grateful for an opportunity to review it. We would share our consolidated feedback with you at the earliest convenience, then offer you the opportunity to associate it with your preprint on bioRxiv and eLife’s <a href="https://sciety.org/groups/biophysics-colab/lists" target="_blank">Sciety</a> platform. However, you would be under no obligation to publicly share the report, which would then remain confidential. 
          </p>
          <p>
            Your agreement to our service would not constitute submission to a journal therefore you would be at liberty to submit your paper for review elsewhere. Indeed, we realise that you may have already done so, and this would not preclude your participation in our project. 
          </p>
          <p>
            Would you be interested in receiving expert feedback on your preprint? If so, please accept our invitation using the link below. If not, we’d be grateful if you let us know via the decline link. I’d be happy to arrange a video call if you’d like to learn more about Biophysics Colab before making a decision.
          </p>
          <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
          <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
          <p>
            Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes two minutes to register a new ORCID account <a href="https://orcid.org/register" target="_blank">here</a>. <br>
            Your invitation id is ‘${invitationId}’
          </p>
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
          <p>`
      break
    default:
      result.cc = ''
      result.subject = 'Kotahi | Permission to review'
      result.content = `<p>Dear ${receiverName},</p>
        <p>
          The manuscript titled ‘${articleTitle}’ has been selected for peer review. Click on the link below to accept or decline the invitation;
        <p>
        <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
        <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
        <p>
          Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
          Your invitation id is ‘${invitationId}’
        </p>
        <p>
          Regards, <br>
          Kotahi team 
        </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = AuthorInvitationEmailTemplate
