import config from 'config'
import { Selector, t } from 'testcafe'

const login = {
  url: `${config.get('pubsweet-server.baseUrl')}/login`,

  username: Selector('form input[type=text]'),
  password: Selector('form input[type=password]'),
  submit: Selector('form button'),

  alert: Selector(() => document.querySelector('form').previousSibling),

  doLogin: (username, password) =>
    t
      .resizeWindow(1920, 1080)
      .navigateTo(login.url)
      .typeText(login.username, username)
      .typeText(login.password, password)
      .click(login.submit),
}

export default login
