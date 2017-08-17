The app bar appears at the top of every page of the application.

It displays the name of the application (as a link to the home page), the username of the current user, and a link to sign out. 

```js
<AppBar
  brandName="xpub"
  loginLink="/login"
  logoutLink="/logout"
  userName="foo"/>
```

When the user is not signed in, only the login link is displayed.

```js
<AppBar
  brandName="xpub"
  loginLink="/login"
  logoutLink="/logout"/>
```
