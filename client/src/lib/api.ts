import { type MediaType } from "@shared/schema";

interface SearchResult {
  id: string;
  title: string;
  creator: string;
  actors?: string;
  year?: string;
  summary?: string;
  imageUrl?: string;
  url?: string;
  metadata: Record<string, any>;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyAuthState {
  originalQuery: string;
}

function parseSpotifyCredentials(apiKey: string): { clientId: string; clientSecret: string } {
  const [clientId, clientSecret] = apiKey.split(':');
  if (!clientId || !clientSecret) {
    throw new Error('Invalid Spotify API key format. Expected format: client_id:client_secret');
  }
  return { clientId, clientSecret };
}

export async function searchMedia(type: MediaType, query: string): Promise<SearchResult[]> {
  const credentials = localStorage.getItem(`${type}_api_key`);
  if (!credentials) {
    throw new Error(`No API credentials found for ${type}`);
  }

  switch (type) {
    case "movie":
      return searchOMDB(query, credentials);
    case "book":
      return searchGoogleBooks(query, credentials);
    case "music":
      return searchSpotify(query, credentials);
    default:
      return [];
  }
}

async function searchOMDB(query: string, apiKey: string): Promise<SearchResult[]> {
  const searchRes = await fetch(
    `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`
  );
  const searchData = await searchRes.json();

  if (!searchData.Search) return [];

  const detailedResults = await Promise.all(
    searchData.Search.map(async (item: any) => {
      const detailRes = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&i=${item.imdbID}`
      );
      const detail = await detailRes.json();

      // Extract specific metadata
      const metadata = {
        actors: detail.Actors !== "N/A" ? detail.Actors : undefined,
        runtime: detail.Runtime !== "N/A" ? detail.Runtime : undefined,
        genre: detail.Genre !== "N/A" ? detail.Genre : undefined,
        language: detail.Language !== "N/A" ? detail.Language : undefined,
        imdbRating: detail.imdbRating !== "N/A" ? detail.imdbRating : undefined,
        releaseDate: detail.Released !== "N/A" ? detail.Released : undefined,
        totalSeasons: detail.totalSeasons !== "N/A" ? detail.totalSeasons : undefined,
        type: detail.Type // movie or series
      };

      return {
        id: detail.imdbID,
        type: "movie",
        title: detail.Title,
        creator: detail.Director !== "N/A" ? detail.Director : "Unknown",
        actors: detail.Actors !== "N/A" ? detail.Actors : undefined,
        year: detail.Year,
        summary: detail.Plot !== "N/A" ? detail.Plot : undefined,
        imageUrl: detail.Poster !== "N/A" ? detail.Poster : undefined,
        url: `http://www.imdb.com/Title/${detail.imdbID}`,
        metadata
      };
    })
  );

  return detailedResults;
}

async function searchGoogleBooks(query: string, apiKey: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`
  );
  const data = await res.json();

  if (!data.items) return [];

  return data.items.map((item: any) => {
    // Extract specific metadata
    const metadata = {
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      category: item.volumeInfo.categories?.[0]
    };

    return {
      id: item.id,
      type: "book",
      title: item.volumeInfo.title,
      creator: item.volumeInfo.authors?.[0] || "Unknown",
      year: item.volumeInfo.publishedDate?.split('-')[0],
      summary: item.volumeInfo.description,
      imageUrl: item.volumeInfo.imageLinks?.thumbnail,
      url: item.volumeInfo.infoLink,
      metadata
    };
  });
}

async function getSpotifyAccessToken(query: string, apiKey: string): Promise<never> {
  const { clientId, clientSecret } = parseSpotifyCredentials(apiKey);
  const state = Math.random().toString(36).substring(7);
  const redirectUri = `${window.location.origin}/spotify-callback`;
  
  // Store credentials for the callback
  const authState: SpotifyAuthState = { originalQuery: query };
  localStorage.setItem('spotify_auth_state', state);
  localStorage.setItem('spotify_auth_data', JSON.stringify(authState));
  localStorage.setItem('spotify_credentials', apiKey);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', '');

  window.location.href = authUrl.toString();
  return new Promise(() => {});
}

async function searchSpotify(query: string, apiKey: string): Promise<SearchResult[]> {
  const accessToken = localStorage.getItem('spotify_access_token');
  
  if (!accessToken) {
    await getSpotifyAccessToken(query, apiKey);
    return [];
  }

  const searchUrl = new URL('https://api.spotify.com/v1/search');
  searchUrl.searchParams.append('q', query);
  searchUrl.searchParams.append('type', 'album');
  searchUrl.searchParams.append('limit', '20');

  const response = await fetch(searchUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('spotify_access_token');
    await getSpotifyAccessToken(query, apiKey);
    return [];
  }

  const data = await response.json();
  
  if (!data.albums?.items) {
    return [];
  }

  return data.albums.items.map((item: any) => {
    // Extract specific metadata
    const metadata = {
      releaseDate: item.release_date,
      albumName: item.name,
      tracks: item.total_tracks,
      discNumber: item.disc_number
    };

    return {
      id: item.id,
      type: "music",
      title: item.name,
      creator: item.artists[0].name,
      year: item.release_date.split('-')[0],
      imageUrl: item.images[0]?.url,
      url: item.external_urls.spotify,
      metadata
    };
  });
}