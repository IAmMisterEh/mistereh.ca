// Unified Worker: Serves static files + handles redirects
// Routes: mistereh.ca/games/*

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle /games/typing → redirect to steam-punk-games
    if (url.pathname === '/games/typing' || url.pathname.startsWith('/games/typing/')) {
      const remainder = url.pathname.replace('/games/typing', '') || '/';
      const targetUrl = new URL(remainder + url.search, 'https://mistereh.ca/steam-punk-games/');
      return Response.redirect(targetUrl.toString(), 302);
    }
    
    // For other /games/* paths, try to serve from steam-punk-games
    // This falls back to the existing working Pages deployment
    if (url.pathname.startsWith('/games/')) {
      const remainder = url.pathname.replace('/games/', '') || 'index.html';
      const targetUrl = `https://mistereh.ca/steam-punk-games/${remainder}`;
      
      try {
        const response = await fetch(targetUrl, {
          method: request.method,
          headers: request.headers,
        });
        
        if (response.ok) {
          return response;
        }
      } catch (e) {
        console.error('Fallback fetch failed:', e);
      }
    }
    
    // Default: 404
    return new Response('Game not found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
