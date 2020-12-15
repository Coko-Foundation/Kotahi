# FAQ

## All I see is a "Recent publications" page with no publications. How do I login?

Go to `/login` on your browser.  
eg. if your app is at `kotahi.myorg.com`, go to `kotahi.myorg.com/login`

## How do I setup ORCID for development?

Getting past the login screen can be a challenge if you haven't set this up correctly. You need two things: an account at `sandbox.orcid.org` and a `mailinator` email. When `NODE_ENV` is set to `development`, the app will expect you to be using a sanbox account. Orcid's sandbox in turn will only send emails to mailinator accounts, so if you don't use mailinator, you won't be able to verify your email (and consequently not be able to set this up).

So here's how to set this up in less than 20 easy steps:

1. Go to [mailinator.com](mailinator.com)
2. In the search bar at the top of the page enter your desired username (we'll use `mycokotestemail` for this guide) and click "GO". (tip: choose a username that is unlikely to be used already by someone else)
3. You'll be taken to a new page. This is your inbox for `mycokotestemail@mailinator.com`. Keep this page open. (also keep in mind that this is a fully **public** inbox)
4. Go to [sandbox.orcid.org](sandbox.orcid.org)
5. Click on "SIGN IN/REGISTER", then on "register now"
6. Fill out the form. In the email field use your newly created mailinator email.
7. Fill out the rest of the form until you register.
8. You'll be taken to your dashboard. Click on your name at the top right, then "Developer Tools".
9. Click on the "Verify your email address to get started" button.
10. Go to your mailinator inbox. Open the email you received from orcid and click on the "Verify your email address" button.
11. Go back to your developer tools section in ORCID. Click on "Register for the free ORCID public API", check the consent box and click on "Continue".
12. You should now be presented with a form. Fill in your application's name, website and description. What you put in these fields shouldn't matter, as this will only be used for development. (tip: if you get an error that your website's URL is invalid, try something generic and include the protocol - eg. `http://www.google.com`)
13. Under "Redirect URIs", add the url of your kotahi client plus `/auth/orcid/callback`. So if in your browser you can see your app under `http://localhost:4000`, the value here should be `http://localhost:4000/auth/orcid/callback`. [1]
14. Click on the floating save icon on the right.
15. You should now be presented with a gray box that gives you a client id and a client secret.
16. Go to your application's environment file and the values you just got.

```sh
export ORCID_CLIENT_ID=your-orcid-client-id
export ORCID_CLIENT_SECRET=your-orcid-client-secret
```

17. Source your environment file to your shell and start the app.

You should now be able to use the login.

_Disclaimer: ORCID is a separate organisation from Coko and we are in no way affiliated with them. This is meant as a guide to make a developer's life easier. If you encounter issues with ORCID services not working as expected, please contact their support._

[1] Even though this URL does not exist for the client (ie. it isn't handled by our `react-router` setup), it will be redirected to the server via `webpack-dev-server`'s proxy.
