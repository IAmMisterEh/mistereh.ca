// Simple redirect Worker: mistereh.ca/steam-punk-games/* → [game-url]/*
// Replace [GAME_URL] with the actual deployment URL below

const GAME_URL = 'https://88eb6ec3.mistereh-ca.pages.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Check if request is for /steam-punk-games/*
    if (url.pathname.startsWith('/steam-punk-games/')) {
      // Strip the /steam-punk-games prefix and append to GAME_URL
      const gamePath = url.pathname.replace('/steam-punk-games', '');
      const targetUrl = new URL(gamePath || '/', GAME_URL);
      
      // Preserve query parameters and hash
      if (url.search) targetUrl.search = url.search;
      if (url.hash) targetUrl.hash = url.hash;
      
      // Redirect to the game
      return Response.redirect(targetUrl.toString(), 302);
    }
    
    // For all other paths, serve the main site (let it fall through to your main site)
    // This Worker will be attached only to the /steam-punk-games/* route
    return new Response('Not found', { status: 404 });
  }
};
