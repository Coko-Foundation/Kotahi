## pubsweet-component-authentication  

A module containing all the PubSweet components needed for authentication. This module uses UI elements from `pubsweet-ui` and brings in the currentUser reducer from `pubsweet-client` so that all the authentication-related redux code is in the same place. A `PrivateRoute` component is used to ensure that the current user is authenticated and loaded before a page is rendered.  

*Note:  
This should be merged with the default authentication components provided by pubsweet.*
