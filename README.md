# WatchReadListen

This is a simple web application born out of the desire to store
recommendations from friends in a more visual way. You can try
it at the following location:

https://watchreadlisten.vercel.app

As an experiement, I used some online AI tools during the creation
of the application including V0, Replit and Cursor to see how
quickly I could prototype something.

## API Access Credentials

To keep things simple for now, you need to create your own set of 
API keys for OMDB, Google Books and Spotify. Any API keys that are
entered into the application are saved to local storage.

In the case of Spotify, you will need to use an API key of the form
`client_id:`client_secret`. You will need to set the callback route
to be https://watchreadlisten.vercel.app/spotify-callback or, if
using in local development mode, http://localhost:3000/spotify-callback.

I'll add more features over time I'm sure if it proves useful to people.
