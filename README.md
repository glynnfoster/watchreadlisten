# WatchReadListen

This is a simple web application born out of the desire to store
recommendations from friends in a more visual way. You can try
it at the following location:

https://watchreadlisten.vercel.app

As an experiment, I used some online AI tools during the creation
of the application including V0, Replit and Cursor to see how
quickly I could prototype something.

## API Access Credentials

To keep things simple for now, you need to create your own set of 
API keys for OMDB, Google Books and Spotify. Any API keys that are
entered into the application are saved to local storage.

### OMDB API

To generate a key with a 1,000 request daily limit, go to
https://www.omdbapi.com/apikey.aspx

### Google Books API

To generate a key, go to https://console.cloud.google.com. You will
need to enable the API service for Google Books. Under API & Services
section select Credentials, and then Create Credentials choosing the
API Key option. It is recommended to restrict the API key for your
particular use.

### Spotify API

To generate a key, go to https://developer.spotify.com. Under the
Dashboard, select Create app. You will need to set the callback
route to be https://watchreadlisten.vercel.app/spotify-callback or,
if using in local development mode, http://localhost:3000/spotify-callback.
Within WatchReadListen you will need to use both the client ID and
client secret in the form `client_id:client_secret`.
