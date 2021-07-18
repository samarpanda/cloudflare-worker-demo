const site = 'qodeify.com';

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  /**
   * Disallow crawlers
   */
  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /', { status: 200 });
  }

  /**
   * When overrideHost is used in a script, WPT sets x-host to original host i.e. site we want to proxy
   */
  const host = request.headers.get('x-host');

  /**
   * Error if x-host header missing
   */
  if (!host) {
    return new Response('x-host header missing', { status: 403 });
  }

  url.hostname = host;
  const bypassTransform = request.headers.get('x-bypass-transform');
  const acceptHeader = request.headers.get('accept');

  /**
   * If it's the original document, and we don't want to bypass the rewrite of HTML
   * TODO will also select sub-documents e.g. iframes, from the same site :-(
   */
  if (
    host === site &&
    acceptHeader &&
    acceptHeader.indexOf('text/html') >= 0 &&
    (!bypassTransform || (bypassTransform && bypassTransform.indexOf('true') === -1))
  ) {
    request.cf.scrapeShield = false;
    const response = await fetch(url.toString(), request);

    return new HTMLRewriter().transform(response);
  }

  if (
    host === site &&
    (!acceptHeader || acceptHeader.indexOf('text/html') < 0) &&
    (!bypassTransform || (bypassTransform && bypassTransform.indexOf('true') === -1))
  ) {
    request.url = url.toString();
    return fetch(url.toString(), request);
  }

  /**
   * Otherwise just proxy the request
   */
  return fetch(url.toString(), request);
}
