// ========================================================
// CLOUDFLARE PAGES MIDDLEWARE: ROUTING & SPA CONTROLLER
// Directs /admin/* to /admin/index.html and ensures clean routing
// ========================================================

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Pass API requests directly to API router
  if (pathname.startsWith('/api')) {
    return context.next();
  }

  // 2. Pass static files with extensions (.css, .js, .svg, .png, .jpg, .ico, etc.)
  if (pathname.includes('.')) {
    return context.next();
  }

  // 3. For any /admin route (/admin, /admin/login, /admin/dashboard, /admin/menu, etc.),
  // serve the dedicated Admin CMS interface
  if (pathname.startsWith('/admin')) {
    if (context.env && context.env.ASSETS) {
      const adminUrl = new URL('/admin/index.html', context.request.url);
      return context.env.ASSETS.fetch(adminUrl);
    }
  }

  // 4. Default: continue to public pages or assets
  return context.next();
}
