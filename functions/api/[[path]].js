// ========================================================
// CLOUDFLARE PAGES FUNCTIONS: COMPLETE REST API EDGE ENGINE
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

// Password verification using Web Crypto API (100% PBKDF2 compatible)
async function verifyPassword(password, saltStr, targetHashHex) {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const salt = enc.encode(saltStr);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-512' },
      key,
      512
    );
    const actualHex = Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return actualHex === targetHashHex;
  } catch (e) {
    return false;
  }
}

async function hashNewPassword(password, saltStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const salt = enc.encode(saltStr);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 10000, hash: 'SHA-512' },
    key,
    512
  );
  return Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Authentication helper
async function getAuth(request, db) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const session = await db.prepare(`
      SELECT s.*, u.id as user_id, u.email, u.name, u.role
      FROM sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).bind(token).first();
    return session || null;
  } catch (err) {
    return null;
  }
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || [];
  const endpoint = '/' + pathParts.join('/');
  const method = request.method.toUpperCase();

  // Handle CORS Preflight
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
    // 1. AUTH LOGIN
    if (endpoint === '/auth/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse({ error: 'Email dan kata sandi wajib diisi.' }, 400);
      }

      const user = await db.prepare('SELECT * FROM admin_users WHERE email = ?').bind(email).first();
      if (!user) {
        return jsonResponse({ error: 'Email atau kata sandi tidak cocok.' }, 401);
      }

      const isValid = await verifyPassword(password, user.salt, user.password_hash);
      if (!isValid) {
        return jsonResponse({ error: 'Email atau kata sandi tidak cocok.' }, 401);
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expiresAt).run();

      return jsonResponse({
        message: 'Login berhasil.',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // 2. AUTH LOGOUT
    if (endpoint === '/auth/logout' && method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      }
      return jsonResponse({ message: 'Berhasil logout.' });
    }

    // 3. AUTH ME
    if (endpoint === '/auth/me' && method === 'GET') {
      const auth = await getAuth(request, db);
      if (!auth) {
        return jsonResponse({ error: 'Sesi login tidak sah atau telah kedaluwarsa.' }, 401);
      }
      return jsonResponse({
        user: { id: auth.user_id, email: auth.email, name: auth.name, role: auth.role }
      });
    }

    // 4. AUTH PROFILE
    if (endpoint === '/auth/profile' && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      if (body.current_password && body.new_password) {
        const user = await db.prepare('SELECT * FROM admin_users WHERE id = ?').bind(auth.user_id).first();
        const isValid = await verifyPassword(body.current_password, user.salt, user.password_hash);
        if (!isValid) {
          return jsonResponse({ error: 'Kata sandi lama tidak sesuai.' }, 400);
        }

        const newSalt = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const newHash = await hashNewPassword(body.new_password, newSalt);
        await db.prepare('UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(newHash, newSalt, auth.user_id).run();

        return jsonResponse({ message: 'Kata sandi berhasil diperbarui.' });
      }

      if (body.name || body.email) {
        await db.prepare('UPDATE admin_users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(body.name || null, body.email || null, auth.user_id).run();

        const updated = await db.prepare('SELECT id, email, name, role FROM admin_users WHERE id = ?').bind(auth.user_id).first();
        return jsonResponse({ message: 'Profil berhasil diperbarui.', user: updated });
      }

      return jsonResponse({ error: 'Data tidak lengkap.' }, 400);
    }

    // 5. DASHBOARD STATS
    if (endpoint === '/stats' && method === 'GET') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const totalMenu = (await db.prepare('SELECT count(*) as count FROM menu_items WHERE is_published = 1').first())?.count || 0;
      const totalGallery = (await db.prepare('SELECT count(*) as count FROM gallery_images WHERE is_published = 1').first())?.count || 0;
      const totalInquiries = (await db.prepare('SELECT count(*) as count FROM inquiries').first())?.count || 0;
      const newWeddingInquiries = (await db.prepare("SELECT count(*) as count FROM inquiries WHERE inquiry_type = 'wedding' AND status = 'new'").first())?.count || 0;

      return jsonResponse({
        stats: {
          total_menu: totalMenu,
          total_gallery: totalGallery,
          total_inquiries: totalInquiries,
          new_wedding_inquiries: newWeddingInquiries
        }
      });
    }

    // 6. WEBSITE CONTENT (CMS)
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

    if (endpoint.startsWith('/content/') && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const sectionKey = endpoint.replace('/content/', '').trim();
      const body = await request.json().catch(() => ({}));

      await db.prepare(`
        INSERT OR REPLACE INTO website_content (section_key, title, subtitle, content, metadata_json, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(
        sectionKey,
        body.title || '',
        body.subtitle || '',
        body.content || '',
        body.metadata_json || '{}'
      ).run();

      return jsonResponse({ message: `Konten bagian ${sectionKey} berhasil disimpan.` });
    }

    // 7. CATEGORIES
    if (endpoint === '/categories' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM menu_categories ORDER BY display_order ASC').all();
      return jsonResponse({ data: results || [] });
    }

    // 8. MENU ITEMS
    if (endpoint === '/menu' && method === 'GET') {
      let sql = `
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN menu_categories c ON m.category_id = c.id
        WHERE 1=1
      `;
      const binds = [];
      const isAuth = await getAuth(request, db);
      if (!isAuth || url.searchParams.get('published_only') === '1') {
        sql += ' AND m.is_published = 1';
      }
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

    if (endpoint.match(/^\/menu\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/').pop());
      const item = await db.prepare(`
        SELECT m.*, c.name as category_name
        FROM menu_items m
        LEFT JOIN menu_categories c ON m.category_id = c.id
        WHERE m.id = ?
      `).bind(id).first();

      if (!item) return jsonResponse({ error: 'Menu tidak ditemukan.' }, 404);
      return jsonResponse({ data: item });
    }

    if (endpoint === '/menu' && method === 'POST') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      if (!body.name || !body.category_id) {
        return jsonResponse({ error: 'Nama menu dan kategori wajib diisi.' }, 400);
      }

      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await db.prepare(`
        INSERT INTO menu_items (category_id, name, slug, description, price, price_confirmed, image_url, is_signature, is_published, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        body.category_id,
        body.name,
        slug,
        body.description || '',
        body.price || 0,
        body.price_confirmed !== undefined ? body.price_confirmed : 1,
        body.image_url || '',
        body.is_signature ? 1 : 0,
        body.is_published !== undefined ? body.is_published : 1,
        body.display_order || 0
      ).run();

      return jsonResponse({ message: 'Menu berhasil ditambahkan.', id: res.meta.last_row_id }, 201);
    }

    if (endpoint.match(/^\/menu\/\d+$/) && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      const body = await request.json().catch(() => ({}));

      await db.prepare(`
        UPDATE menu_items SET
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          price_confirmed = COALESCE(?, price_confirmed),
          image_url = COALESCE(?, image_url),
          is_signature = COALESCE(?, is_signature),
          is_published = COALESCE(?, is_published),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.category_id !== undefined ? body.category_id : null,
        body.name || null,
        body.description !== undefined ? body.description : null,
        body.price !== undefined ? body.price : null,
        body.price_confirmed !== undefined ? body.price_confirmed : null,
        body.image_url !== undefined ? body.image_url : null,
        body.is_signature !== undefined ? body.is_signature : null,
        body.is_published !== undefined ? body.is_published : null,
        id
      ).run();

      return jsonResponse({ message: 'Menu berhasil diperbarui.' });
    }

    if (endpoint.match(/^\/menu\/\d+$/) && method === 'DELETE') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      await db.prepare('DELETE FROM menu_items WHERE id = ?').bind(id).run();
      return jsonResponse({ message: 'Menu berhasil dihapus.' });
    }

    // 9. VENUE & FACILITIES
    if (endpoint === '/venue' && method === 'GET') {
      const venue = await db.prepare('SELECT * FROM venue_info LIMIT 1').first();
      return jsonResponse({ data: venue || {} });
    }

    if (endpoint === '/venue' && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      await db.prepare(`
        UPDATE venue_info SET
          name = COALESCE(?, name),
          tagline = COALESCE(?, tagline),
          description = COALESCE(?, description),
          capacity_seated = COALESCE(?, capacity_seated),
          capacity_standing = COALESCE(?, capacity_standing),
          indoor_area_desc = COALESCE(?, indoor_area_desc),
          outdoor_area_desc = COALESCE(?, outdoor_area_desc),
          hero_image = COALESCE(?, hero_image),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).bind(
        body.name || null,
        body.tagline || null,
        body.description || null,
        body.capacity_seated || null,
        body.capacity_standing || null,
        body.indoor_area_desc || null,
        body.outdoor_area_desc || null,
        body.hero_image || null
      ).run();

      return jsonResponse({ message: 'Informasi venue berhasil diperbarui.' });
    }

    if (endpoint === '/facilities' && method === 'GET') {
      const { results } = await db.prepare('SELECT * FROM venue_facilities WHERE is_available = 1 ORDER BY display_order ASC').all();
      return jsonResponse({ data: results || [] });
    }

    // 10. PACKAGES
    if (endpoint === '/packages' && method === 'GET') {
      const isAuth = await getAuth(request, db);
      const sql = isAuth 
        ? 'SELECT * FROM wedding_packages ORDER BY display_order ASC, price ASC'
        : 'SELECT * FROM wedding_packages WHERE is_active = 1 ORDER BY display_order ASC, price ASC';
      const { results } = await db.prepare(sql).all();
      return jsonResponse({ data: results || [] });
    }

    if (endpoint.match(/^\/packages\/\d+$/) && method === 'GET') {
      const id = parseInt(endpoint.split('/').pop());
      const pkg = await db.prepare('SELECT * FROM wedding_packages WHERE id = ?').bind(id).first();
      if (!pkg) return jsonResponse({ error: 'Paket tidak ditemukan.' }, 404);
      return jsonResponse({ data: pkg });
    }

    if (endpoint === '/packages' && method === 'POST') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await db.prepare(`
        INSERT INTO wedding_packages (name, slug, price, pax, description, inclusions_json, is_featured, is_active, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        body.name,
        slug,
        body.price,
        body.pax,
        body.description || '',
        body.inclusions_json || '[]',
        body.is_featured ? 1 : 0,
        body.is_active !== undefined ? body.is_active : 1,
        body.display_order || 0
      ).run();

      return jsonResponse({ message: 'Paket berhasil ditambahkan.', id: res.meta.last_row_id }, 201);
    }

    if (endpoint.match(/^\/packages\/\d+$/) && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      const body = await request.json().catch(() => ({}));

      await db.prepare(`
        UPDATE wedding_packages SET
          name = COALESCE(?, name),
          price = COALESCE(?, price),
          pax = COALESCE(?, pax),
          description = COALESCE(?, description),
          inclusions_json = COALESCE(?, inclusions_json),
          is_featured = COALESCE(?, is_featured),
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).bind(
        body.name || null,
        body.price !== undefined ? body.price : null,
        body.pax !== undefined ? body.pax : null,
        body.description !== undefined ? body.description : null,
        body.inclusions_json !== undefined ? body.inclusions_json : null,
        body.is_featured !== undefined ? body.is_featured : null,
        body.is_active !== undefined ? body.is_active : null,
        id
      ).run();

      return jsonResponse({ message: 'Paket berhasil diperbarui.' });
    }

    if (endpoint.match(/^\/packages\/\d+$/) && method === 'DELETE') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      await db.prepare('DELETE FROM wedding_packages WHERE id = ?').bind(id).run();
      return jsonResponse({ message: 'Paket berhasil dihapus.' });
    }

    // 11. GALLERY
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

    if (endpoint === '/gallery' && method === 'POST') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      if (!body.title || !body.image_url) {
        return jsonResponse({ error: 'Judul dan URL foto wajib diisi.' }, 400);
      }

      const res = await db.prepare(`
        INSERT INTO gallery_images (title, category, image_url, description, is_featured, is_published, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        body.title,
        body.category || 'venue',
        body.image_url,
        body.description || '',
        body.is_featured ? 1 : 0,
        body.is_published !== undefined ? body.is_published : 1,
        body.display_order || 0
      ).run();

      return jsonResponse({ message: 'Foto galeri berhasil disimpan.', id: res.meta.last_row_id }, 201);
    }

    if (endpoint.match(/^\/gallery\/\d+$/) && method === 'DELETE') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      await db.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();
      return jsonResponse({ message: 'Foto berhasil dihapus.' });
    }

    // 12. TESTIMONIALS
    if (endpoint === '/testimonials' && method === 'GET') {
      const isAuth = await getAuth(request, db);
      const sql = isAuth 
        ? 'SELECT * FROM testimonials ORDER BY id DESC' 
        : 'SELECT * FROM testimonials WHERE is_published = 1 ORDER BY id DESC';
      const { results } = await db.prepare(sql).all();
      return jsonResponse({ data: results || [] });
    }

    if (endpoint === '/testimonials' && method === 'POST') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const body = await request.json().catch(() => ({}));
      const res = await db.prepare(`
        INSERT INTO testimonials (customer_name, customer_role_or_event, quote, rating, event_date, is_published)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        body.customer_name,
        body.customer_role_or_event || '',
        body.quote,
        body.rating || 5,
        body.event_date || '',
        body.is_published !== undefined ? body.is_published : 1
      ).run();

      return jsonResponse({ message: 'Testimoni berhasil disimpan.', id: res.meta.last_row_id }, 201);
    }

    if (endpoint.match(/^\/testimonials\/\d+$/) && method === 'DELETE') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      await db.prepare('DELETE FROM testimonials WHERE id = ?').bind(id).run();
      return jsonResponse({ message: 'Testimoni berhasil dihapus.' });
    }

    // 13. INQUIRIES
    if (endpoint === '/inquiries' && method === 'GET') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      let sql = 'SELECT * FROM inquiries WHERE 1=1';
      const binds = [];
      if (url.searchParams.get('type')) {
        sql += ' AND inquiry_type = ?';
        binds.push(url.searchParams.get('type'));
      }
      if (url.searchParams.get('status')) {
        sql += ' AND status = ?';
        binds.push(url.searchParams.get('status'));
      }
      sql += ' ORDER BY id DESC';
      if (url.searchParams.get('limit')) {
        sql += ' LIMIT ?';
        binds.push(parseInt(url.searchParams.get('limit')));
      }

      const { results } = await db.prepare(sql).bind(...binds).all();
      return jsonResponse({ data: results || [] });
    }

    if (endpoint.match(/^\/inquiries\/\d+$/) && method === 'GET') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      const inq = await db.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first();
      if (!inq) return jsonResponse({ error: 'Inquiry tidak ditemukan.' }, 404);
      return jsonResponse({ data: inq });
    }

    if (endpoint === '/inquiries' && method === 'POST') {
      // PUBLIC ENDPOINT! Visitors submit inquiry forms here
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

    if (endpoint.match(/^\/inquiries\/\d+$/) && method === 'PUT') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      const body = await request.json().catch(() => ({}));

      await db.prepare(`
        UPDATE inquiries SET
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(body.status || null, body.notes !== undefined ? body.notes : null, id).run();

      return jsonResponse({ message: 'Status/catatan inquiry berhasil diperbarui.' });
    }

    if (endpoint.match(/^\/inquiries\/\d+$/) && method === 'DELETE') {
      const auth = await getAuth(request, db);
      if (!auth) return jsonResponse({ error: 'Tidak memiliki izin.' }, 401);

      const id = parseInt(endpoint.split('/').pop());
      await db.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
      return jsonResponse({ message: 'Inquiry berhasil dihapus.' });
    }

    return jsonResponse({ error: `Endpoint API ${endpoint} tidak ditemukan.` }, 404);

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
