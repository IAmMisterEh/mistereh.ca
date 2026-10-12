// Pages Function to bypass static cache and serve latest content
export default async function onRequest({ request, params }) {
  const path = params.path || '';
  const fullPath = path.endsWith('/') ? path : path + '/';
  const targetUrl = `https://658c42ad.mistereh-games-auto.pages.dev/steam-punk-games/${fullPath}`;
  
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
