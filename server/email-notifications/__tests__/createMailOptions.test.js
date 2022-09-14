const createMailOptions = require('../createMailOptions')

const receiver = 'drjohn@example.com'
const template = 'authorInvitationEmailTemplate'

const data = {
  articleTitle: 'Sample Article Title Foo Bar',
  authorName: 'Jane',
  currentUser: 'Jane',
  receiverName: 'Dr. John Doe',
  shortId: 1,
  toEmail: 'hi@jane.com',
  invitationId: 'eb2ca7d0-6a06-4dfb-ac10-ddfd7663e494',
  purpose: 'Inviting an author to accept a manuscript',
  status: 'UNANSWERED',
  senderId: 'e4066a06-45c2-4a95-8211-533af9a46f62',
  appUrl: 'http://localhost:4000',
  instance: 'colab',
}

describe('Verify email HTML contents', () => {
  test('Author Invitation Email Template Colab', () => {
    const authorInvitationEmailTemplateColabHtml =
      '<p>Dear Dr. John Doe,</p>        <p>          The manuscript titled ‘Sample Article Title Foo Bar’ has been selected for peer review. Click on the link below to accept or decline the invitation;        <p>        <p><a href="http://localhost:4000/acceptarticle/eb2ca7d0-6a06-4dfb-ac10-ddfd7663e494" target="_blank">Accept invitation</a></p>        <p><a href="http://localhost:4000/decline/eb2ca7d0-6a06-4dfb-ac10-ddfd7663e494" target="_blank">Decline invitation</a></p>        <p>          Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>          Your invitation id is ‘eb2ca7d0-6a06-4dfb-ac10-ddfd7663e494’        </p>        <p>          Regards, <br>          Kotahi team         </p>'

    expect(createMailOptions(receiver, template, data).html).toEqual(
      authorInvitationEmailTemplateColabHtml,
    )
  })
})
