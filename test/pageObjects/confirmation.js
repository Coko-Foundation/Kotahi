import { Selector } from 'testcafe'

const confirmation = {
  submitManuscript: Selector('button[type=submit]'),
  returnToSubmission: Selector('button').withText(
    'GET BACK TO YOUR SUBMISSION',
  ),
}

export default confirmation
