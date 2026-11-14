// Router Worker: Handles path-based routing for mistereh.ca
// - mistereh.ca/ → "Coming soon" (main site)
// - mistereh.ca/steam-punk-games/* → Game project
// - mistereh.ca/future-game/* → Future game projects

const GAMES_PROJECT_URL = 'https://16136169.mistereh-games-auto.pages.dev';
const MAIN_SITE_URL = 'https://mistereh-ca.pages.dev'; // Your main "Coming soon" site

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Extract the path
    const path = url.pathname;
    
    // Route: mistereh.ca/games/typing* → Clockwork Words (redirect to steam-punk-games)
    if (path === '/games/typing' || path.startsWith('/games/typing/')) {
      const gamePath = path.replace('/games/typing', '') || '/';
      const targetUrl = new URL(gamePath + (url.search || ''), GAMES_PROJECT_URL + '/steam-punk-games/');
      return Response.redirect(targetUrl.toString(), 302);
    }

    // Route: mistereh.ca/steam-punk-games/* → Game project
    if (path.startsWith('/steam-punk-games/')) {
      const gamePath = path.replace('/steam-punk-games', '');
      const targetUrl = new URL(gamePath || '/', GAMES_PROJECT_URL);
      
      // Preserve query params and hash
      if (url.search) targetUrl.search = url.search;
      if (url.hash) targetUrl.hash = url.hash;
      
      return fetch(new Request(targetUrl, { 
        headers: request.headers,
        method: request.method
      }));
    }
    
    // Route: mistereh.ca/future-game/* → Future game project (placeholder)
    if (path.startsWith('/future-game/')) {
      // For now, return a "Coming soon" message for future games
      return new Response(`
        <html>
          <head><title>Future Game - Coming Soon</title></head>
          <body>
            <h1>🚀 Future Game</h1>
            <p>Coming soon to mistereh.ca/future-game/</p>
          </body>
        </html>
      `, { 
        headers: { 'Content-Type': 'text/html' } 
      });
    }
    
    // Default: mistereh.ca/ → Main "Coming soon" site
    // For now, serve a simple "Coming soon" page
    if (path === '/' || path === '/index.html') {
      return new Response(`
        <html>
          <head>
            <title>MisterEh - Coming Soon</title>
            <style>
              body { 
                font-family: system-ui, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
              }
              h1 { font-size: 3em; margin-bottom: 0.5em; }
              p { font-size: 1.5em; opacity: 0.9; }
              a { color: #ffd700; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div>
              <h1>🚧 Coming Soon</h1>
              <p>MisterEh's classroom adventures are loading...</p>
              <p><a href="/steam-punk-games/">🎮 Play Clockwork Words</a></p>
            </div>
          </body>
        </html>
      `, { 
        headers: { 'Content-Type': 'text/html' } 
      });
    }
    
    // 404 for everything else
    return new Response('Not Found', { status: 404 });
  }
};
