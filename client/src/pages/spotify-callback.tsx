import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

function parseSpotifyCredentials(apiKey: string): { clientId: string; clientSecret: string } {
  const [clientId, clientSecret] = apiKey.split(':');
  if (!clientId || !clientSecret) {
    throw new Error('Invalid Spotify API key format. Expected format: client_id:client_secret');
  }
  return { clientId, clientSecret };
}

export function SpotifyCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const storedState = localStorage.getItem('spotify_auth_state');
      const credentials = localStorage.getItem('spotify_credentials');
      const authDataStr = localStorage.getItem('spotify_auth_data');

      if (!code || state !== storedState || !credentials || !authDataStr) {
        console.error('Auth validation failed');
        setLocation('/');
        return;
      }

      try {
        const { clientId, clientSecret } = parseSpotifyCredentials(credentials);
        const authData = JSON.parse(authDataStr) as SpotifyAuthState;
        
        // Create Basic Auth header
        const basicAuth = btoa(`${clientId}:${clientSecret}`);

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${window.location.origin}/spotify-callback`,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token response error:', errorData);
          throw new Error('Failed to get access token');
        }

        const tokenData = await tokenResponse.json();
        
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        
        // Clean up auth data
        localStorage.removeItem('spotify_auth_state');
        localStorage.removeItem('spotify_auth_data');
        localStorage.removeItem('spotify_credentials');

        await queryClient.invalidateQueries({ queryKey: ['media-search', 'music'] });

        setLocation('/search');
        window.dispatchEvent(new CustomEvent('spotify-auth-complete', {
          detail: { query: authData.originalQuery }
        }));

      } catch (error) {
        console.error('Token exchange failed:', error);
        setLocation('/');
      }
    }

    handleCallback();
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Spotify Authentication</h1>
        <p className="mb-2">Processing authentication...</p>
      </div>
    </div>
  );
} 