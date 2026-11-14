// Redirect Worker: mistereh.ca/games/typing → Clockwork Words v3.0
// Directs all requests to the live game URL

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Only handle the specific path
    if (url.pathname === '/games/typing' || url.pathname.startsWith('/games/typing/')) {
      // Extract any sub-path or query params
      const remainder = url.pathname.replace('/games/typing', '') || '/';
      const targetUrl = new URL(remainder + url.search, 'https://mistereh.ca/steam-punk-games/');
      
      // Return a 302 redirect
      return Response.redirect(targetUrl.toString(), 302);
    }
    
    // If not the games/typing path, return 404
    return new Response('Not found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
