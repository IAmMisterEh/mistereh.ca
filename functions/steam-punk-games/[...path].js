// Pages Function to bypass static cache and serve latest content
export default async function onRequest({ request, params }) {
  const path = params.path || '';
  const fullPath = path.endsWith('/') ? path : path + '/';
  // Use the latest deployment by hitting the project root and letting Cloudflare redirect
  // Add a timestamp to force fresh fetch
  const bustParam = `?t=${Date.now()}`;
  const targetUrl = `https://mistereh-games-auto.pages.dev/steam-punk-games/${fullPath}${bustParam}`;
  
  const response = await fetch(targetUrl, {
    headers: { 'Accept': 'text/html, application/json' }
  });
  
  // Pass through headers but force revalidation
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}
