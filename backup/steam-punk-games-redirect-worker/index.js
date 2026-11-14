// Redirect Worker: mistereh.ca/games/typing → game deployment
// Handles both path-based route and optional subdomain fallback

const GAME_URL = 'https://88eb6ec3.mistereh-ca.pages.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Check if this is a path-based request: mistereh.ca/games/typing
    if (url.hostname === 'mistereh.ca' || url.hostname.endsWith('.mistereh.ca')) {
      // Path-based routing
      if (url.pathname.startsWith('/games/typing')) {
        // Redirect to game, preserving any query params
        const gamePath = url.pathname.replace(/^\/games\/typing/, '') || '/';
        const targetUrl = new URL(gamePath, GAME_URL);
        if (url.search) targetUrl.search = url.search;
        if (url.hash) targetUrl.hash = url.hash;
        return Response.redirect(targetUrl.toString(), 302);
      }
      
      // Optional: redirect /games/* to game root
      if (url.pathname.startsWith('/games/')) {
        const gamePath = url.pathname.replace(/^\/games\/, '') || '/';
        const targetUrl = new URL(gamePath, GAME_URL);
        if (url.search) targetUrl.search = url.search;
        if (url.hash) targetUrl.hash = url.hash;
        return Response.redirect(targetUrl.toString(), 302);
      }
    }
    
    // Fallback: handle games.mistereh.ca subdomain
    if (url.hostname === 'games.mistereh.ca') {
      const gamePath = url.pathname || '/';
      const targetUrl = new URL(gamePath, GAME_URL);
      if (url.search) targetUrl.search = url.search;
      if (url.hash) targetUrl.hash = url.hash;
      return Response.redirect(targetUrl.toString(), 302);
    }
    
    // If no match, return 404
    return new Response('Not found', { status: 404 });
  }
};
