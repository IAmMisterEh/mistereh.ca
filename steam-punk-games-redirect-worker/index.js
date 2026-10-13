// Simple redirect Worker: games.mistereh.ca → game deployment
// Redirects all requests from games.mistereh.ca/* to the game URL

const GAME_URL = 'https://88eb6ec3.mistereh-ca.pages.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Extract the path after the subdomain
    // e.g., games.mistereh.ca/some/path → /some/path
    let gamePath = url.pathname;
    
    // If root, redirect to game root
    if (gamePath === '/') {
      gamePath = '/';
    }
    
    // Construct the target URL
    const targetUrl = new URL(gamePath, GAME_URL);
    
    // Preserve query parameters and hash
    if (url.search) targetUrl.search = url.search;
    if (url.hash) targetUrl.hash = url.hash;
    
    // Redirect to the game
    return Response.redirect(targetUrl.toString(), 302);
  }
};
