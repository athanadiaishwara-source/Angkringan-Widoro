// ========================================================
// CLOUDFLARE PAGES FUNCTIONS: REST API EDGE ENGINE
// Runs on Cloudflare Workers Runtime & Connects to Cloudflare D1
// ========================================================

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    }
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || [];
  const endpoint = '/' + pathParts.join('/');
  const method = request.method.toUpperCase();

  // Handle CORS
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    });
  }

  const db = env.DB;
  if (!db) {
    return jsonResponse({
      error: 'Cloudflare D1 Database binding "DB" tidak ditemukan di environment.'
    }, 500);
  }

  try {
    // 1. PUBLIC INQUIRIES
    if (endpoint === '/inquiries' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!body.customer_name || !body.whatsapp || !body.message) {
        return jsonResponse({ error: 'Nama, nomor WhatsApp, dan pesan wajib diisi.' }, 400);
      }

      const res = await db.prepare(`
        INSERT INTO inquiries (inquiry_type, customer_name, whatsapp, email, event_type, event_date, guest_count, message, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', '')
      `).bind(
        body.inquiry_type || 'general',
        body.customer_name,
        body.whatsapp,
        body.email || '',
        body.event_type || '',
        body.event_date || '',
        body.guest_count ? parseInt(body.guest_count) : null,
        body.message
      ).run();

      return jsonResponse({
        message: 'Pengajuan inquiry Anda berhasil dikirim ke pengelola Angkringan Widoro!',
        id: res.meta.last_row_id
      }, 201);
    }

    // 2. PUBLIC CONTENT (CMS)
    if (endpoint === '/content' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM website_content').all();
      const contentMap = {};
      for (const r of (results || [])) {
        let meta = {};
        try { meta = JSON.parse(r.metadata_json || '{}'); } catch(e) {}
        contentMap[r.section_key] = {
          title: r.title,
          subtitle: r.subtitle,
          content: r.content,
          metadata: meta
        };
      }
      return jsonResponse(contentMap);
    }

    // 3. MENU ITEMS
    if (endpoint === '/menu' && method === 'GET') {
      let sql = `
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN menu_categories c ON m.category_id = c.id
        WHERE m.is_published = 1
      `;
      const binds = [];
      if (url.searchParams.get('signature') === '1') {
        sql += ' AND m.is_signature = 1';
      }
      if (url.searchParams.get('category_id')) {
        sql += ' AND m.category_id = ?';
        binds.push(parseInt(url.searchParams.get('category_id')));
      }
      sql += ' ORDER BY m.is_signature DESC, m.display_order ASC, m.id DESC';

      const { results } = await db.prepare(sql).bind(...binds).all();
      return jsonResponse({ data: results || [] });
    }

    // 4. CATEGORIES
    if (endpoint === '/categories' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM menu_categories ORDER BY display_order ASC').all();
      return jsonResponse({ data: results || [] });
    }

    // 5. PACKAGES
    if (endpoint === '/packages' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM wedding_packages WHERE is_active = 1 ORDER BY display_order ASC, price ASC').all();
      return jsonResponse({ data: results || [] });
    }

    // 6. FACILITIES
    if (endpoint === '/facilities' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM venue_facilities WHERE is_available = 1 ORDER BY display_order ASC').all();
      return jsonResponse({ data: results || [] });
    }

    // 7. VENUE INFO
    if (endpoint === '/venue' && method === 'GET') {
      const venue = await db.prepare('SELECT * FROM venue_info LIMIT 1').first();
      return jsonResponse({ data: venue || {} });
    }

    // 8. GALLERY
    if (endpoint === '/gallery' && method === 'GET') {
      let sql = 'SELECT * FROM gallery_images WHERE is_published = 1';
      const binds = [];
      if (url.searchParams.get('category')) {
        sql += ' AND category = ?';
        binds.push(url.searchParams.get('category'));
      }
      sql += ' ORDER BY display_order ASC, id DESC';
      if (url.searchParams.get('limit')) {
        sql += ' LIMIT ?';
        binds.push(parseInt(url.searchParams.get('limit')));
      }
      const { results } = await db.prepare(sql).bind(...binds).all();
      return jsonResponse({ data: results || [] });
    }

    // 9. TESTIMONIALS
    if (endpoint === '/testimonials' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM testimonials WHERE is_published = 1 ORDER BY id DESC').all();
      return jsonResponse({ data: results || [] });
    }

    // 10. AUTH LOGIN
    if (endpoint === '/auth/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const user = await db.prepare('SELECT * FROM admin_users WHERE email = ?').bind(body.email).first();
      if (!user) {
        return jsonResponse({ error: 'Email atau kata sandi tidak cocok.' }, 401);
      }
      // Simple token issuance
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expiresAt).run();

      return jsonResponse({
        message: 'Login berhasil.',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // Default fallback
    return jsonResponse({ message: `API Endpoint ${endpoint} siap di Cloudflare Pages Functions.` }, 200);

  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
