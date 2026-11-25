// ========================================================
// UNIVERSAL FULL-STACK SERVER: ANGKRINGAN WIDORO
// Node.js HTTP Server + SQLite REST API Engine
// Zero External Dependencies • Production-Ready • Cloudflare D1 Equivalent
// ========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'database.sqlite');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize / Connect SQLite DB
let db;
function initDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('Database belum ada, menjalankan seeding otomatis...');
    require('./data/seed.js');
  }
  db = new DatabaseSync(DB_PATH);
  console.log('✅ SQLite Database tersambung di:', DB_PATH);
}

// Password hashing utility
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// MIME types map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Parse JSON request body helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Response helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Auth middleware helper
function authenticate(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const session = db.prepare(`
      SELECT s.*, u.id as user_id, u.email, u.name, u.role
      FROM sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).get(token);

    return session || null;
  } catch (err) {
    return null;
  }
}

// ========================================================
// API ROUTER
// ========================================================
async function handleApiRequest(req, res, parsedUrl) {
  const method = req.method.toUpperCase();
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // 1. AUTHENTICATION ENDPOINTS
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return sendJSON(res, 400, { error: 'Email dan kata sandi wajib diisi.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
    if (!user) {
      return sendJSON(res, 401, { error: 'Email atau kata sandi tidak cocok.' });
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.password_hash) {
      return sendJSON(res, 401, { error: 'Email atau kata sandi tidak cocok.' });
    }

    // Create session (expires in 7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, user.id, expiresAt);

    return sendJSON(res, 200, {
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    return sendJSON(res, 200, { message: 'Berhasil logout.' });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const auth = authenticate(req);
    if (!auth) {
      return sendJSON(res, 401, { error: 'Sesi login tidak sah atau telah kedaluwarsa.' });
    }
    return sendJSON(res, 200, {
      user: {
        id: auth.user_id,
        email: auth.email,
        name: auth.name,
        role: auth.role
      }
    });
  }

  if (pathname === '/api/auth/profile' && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    if (body.current_password && body.new_password) {
      const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(auth.user_id);
      const testHash = hashPassword(body.current_password, user.salt);
      if (testHash !== user.password_hash) {
        return sendJSON(res, 400, { error: 'Kata sandi lama tidak sesuai.' });
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(body.new_password, newSalt);
      db.prepare(`
        UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(newHash, newSalt, auth.user_id);

      return sendJSON(res, 200, { message: 'Kata sandi berhasil diperbarui.' });
    }

    if (body.name || body.email) {
      db.prepare(`
        UPDATE admin_users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(body.name || null, body.email || null, auth.user_id);

      const updated = db.prepare('SELECT id, email, name, role FROM admin_users WHERE id = ?').get(auth.user_id);
      return sendJSON(res, 200, { message: 'Profil berhasil diperbarui.', user: updated });
    }

    return sendJSON(res, 400, { error: 'Data tidak lengkap.' });
  }

  // 2. DASHBOARD STATS
  if (pathname === '/api/stats' && method === 'GET') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const totalMenu = db.prepare('SELECT count(*) as count FROM menu_items WHERE is_published = 1').get().count;
    const totalGallery = db.prepare('SELECT count(*) as count FROM gallery_images WHERE is_published = 1').get().count;
    const totalInquiries = db.prepare('SELECT count(*) as count FROM inquiries').get().count;
    const newWeddingInquiries = db.prepare("SELECT count(*) as count FROM inquiries WHERE inquiry_type = 'wedding' AND status = 'new'").get().count;

    return sendJSON(res, 200, {
      stats: {
        total_menu: totalMenu,
        total_gallery: totalGallery,
        total_inquiries: totalInquiries,
        new_wedding_inquiries: newWeddingInquiries
      }
    });
  }

  // 3. WEBSITE CONTENT (CMS)
  if (pathname === '/api/content' && method === 'GET') {
    const rows = db.prepare('SELECT * FROM website_content').all();
    const contentMap = {};
    for (const r of rows) {
      let meta = {};
      try {
        meta = JSON.parse(r.metadata_json || '{}');
      } catch (e) {}
      contentMap[r.section_key] = {
        title: r.title,
        subtitle: r.subtitle,
        content: r.content,
        metadata: meta
      };
    }
    return sendJSON(res, 200, contentMap);
  }

  if (pathname.startsWith('/api/content/') && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const sectionKey = pathname.replace('/api/content/', '').trim();
    const body = await parseBody(req);

    db.prepare(`
      INSERT OR REPLACE INTO website_content (section_key, title, subtitle, content, metadata_json, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      sectionKey,
      body.title || '',
      body.subtitle || '',
      body.content || '',
      body.metadata_json || '{}'
    );

    return sendJSON(res, 200, { message: `Konten bagian ${sectionKey} berhasil disimpan.` });
  }

  // 4. CATEGORIES
  if (pathname === '/api/categories' && method === 'GET') {
    const categories = db.prepare('SELECT * FROM menu_categories ORDER BY display_order ASC').all();
    return sendJSON(res, 200, { data: categories });
  }

  // 5. MENU ITEMS
  if (pathname === '/api/menu' && method === 'GET') {
    let sql = `
      SELECT m.*, c.name as category_name
      FROM menu_items m
      LEFT JOIN menu_categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    const isAuth = authenticate(req);
    if (!isAuth || searchParams.get('published_only') === '1') {
      sql += ' AND m.is_published = 1';
    }

    if (searchParams.get('signature') === '1') {
      sql += ' AND m.is_signature = 1';
    }

    if (searchParams.get('category_id')) {
      sql += ' AND m.category_id = ?';
      params.push(parseInt(searchParams.get('category_id')));
    }

    sql += ' ORDER BY m.is_signature DESC, m.display_order ASC, m.id DESC';
    const items = db.prepare(sql).all(...params);
    return sendJSON(res, 200, { data: items });
  }

  if (pathname.match(/^\/api\/menu\/\d+$/) && method === 'GET') {
    const id = parseInt(pathname.split('/').pop());
    const item = db.prepare(`
      SELECT m.*, c.name as category_name
      FROM menu_items m
      LEFT JOIN menu_categories c ON m.category_id = c.id
      WHERE m.id = ?
    `).get(id);

    if (!item) return sendJSON(res, 404, { error: 'Menu tidak ditemukan.' });
    return sendJSON(res, 200, { data: item });
  }

  if (pathname === '/api/menu' && method === 'POST') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    if (!body.name || !body.category_id) {
      return sendJSON(res, 400, { error: 'Nama menu dan kategori wajib diisi.' });
    }

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = db.prepare(`
      INSERT INTO menu_items (category_id, name, slug, description, price, price_confirmed, image_url, is_signature, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
    );

    return sendJSON(res, 201, { message: 'Menu berhasil ditambahkan.', id: result.lastInsertRowid });
  }

  if (pathname.match(/^\/api\/menu\/\d+$/) && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    const body = await parseBody(req);

    db.prepare(`
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
    `).run(
      body.category_id !== undefined ? body.category_id : null,
      body.name || null,
      body.description !== undefined ? body.description : null,
      body.price !== undefined ? body.price : null,
      body.price_confirmed !== undefined ? body.price_confirmed : null,
      body.image_url !== undefined ? body.image_url : null,
      body.is_signature !== undefined ? body.is_signature : null,
      body.is_published !== undefined ? body.is_published : null,
      id
    );

    return sendJSON(res, 200, { message: 'Menu berhasil diperbarui.' });
  }

  if (pathname.match(/^\/api\/menu\/\d+$/) && method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    return sendJSON(res, 200, { message: 'Menu berhasil dihapus.' });
  }

  // 6. VENUE & FACILITIES
  if (pathname === '/api/venue' && method === 'GET') {
    const venue = db.prepare('SELECT * FROM venue_info LIMIT 1').get();
    return sendJSON(res, 200, { data: venue });
  }

  if (pathname === '/api/venue' && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    db.prepare(`
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
    `).run(
      body.name || null,
      body.tagline || null,
      body.description || null,
      body.capacity_seated || null,
      body.capacity_standing || null,
      body.indoor_area_desc || null,
      body.outdoor_area_desc || null,
      body.hero_image || null
    );

    return sendJSON(res, 200, { message: 'Informasi venue berhasil diperbarui.' });
  }

  if (pathname === '/api/facilities' && method === 'GET') {
    const facilities = db.prepare('SELECT * FROM venue_facilities WHERE is_available = 1 ORDER BY display_order ASC').all();
    return sendJSON(res, 200, { data: facilities });
  }

  // 7. WEDDING PACKAGES
  if (pathname === '/api/packages' && method === 'GET') {
    const isAuth = authenticate(req);
    const sql = isAuth 
      ? 'SELECT * FROM wedding_packages ORDER BY display_order ASC, price ASC'
      : 'SELECT * FROM wedding_packages WHERE is_active = 1 ORDER BY display_order ASC, price ASC';
    const packages = db.prepare(sql).all();
    return sendJSON(res, 200, { data: packages });
  }

  if (pathname.match(/^\/api\/packages\/\d+$/) && method === 'GET') {
    const id = parseInt(pathname.split('/').pop());
    const pkg = db.prepare('SELECT * FROM wedding_packages WHERE id = ?').get(id);
    if (!pkg) return sendJSON(res, 404, { error: 'Paket tidak ditemukan.' });
    return sendJSON(res, 200, { data: pkg });
  }

  if (pathname === '/api/packages' && method === 'POST') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = db.prepare(`
      INSERT INTO wedding_packages (name, slug, price, pax, description, inclusions_json, is_featured, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.name,
      slug,
      body.price,
      body.pax,
      body.description || '',
      body.inclusions_json || '[]',
      body.is_featured ? 1 : 0,
      body.is_active !== undefined ? body.is_active : 1,
      body.display_order || 0
    );

    return sendJSON(res, 201, { message: 'Paket berhasil ditambahkan.', id: result.lastInsertRowid });
  }

  if (pathname.match(/^\/api\/packages\/\d+$/) && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    const body = await parseBody(req);

    db.prepare(`
      UPDATE wedding_packages SET
        name = COALESCE(?, name),
        price = COALESCE(?, price),
        pax = COALESCE(?, pax),
        description = COALESCE(?, description),
        inclusions_json = COALESCE(?, inclusions_json),
        is_featured = COALESCE(?, is_featured),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(
      body.name || null,
      body.price !== undefined ? body.price : null,
      body.pax !== undefined ? body.pax : null,
      body.description !== undefined ? body.description : null,
      body.inclusions_json !== undefined ? body.inclusions_json : null,
      body.is_featured !== undefined ? body.is_featured : null,
      body.is_active !== undefined ? body.is_active : null,
      id
    );

    return sendJSON(res, 200, { message: 'Paket berhasil diperbarui.' });
  }

  if (pathname.match(/^\/api\/packages\/\d+$/) && method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    db.prepare('DELETE FROM wedding_packages WHERE id = ?').run(id);
    return sendJSON(res, 200, { message: 'Paket berhasil dihapus.' });
  }

  // 8. GALLERY IMAGES
  if (pathname === '/api/gallery' && method === 'GET') {
    let sql = 'SELECT * FROM gallery_images WHERE is_published = 1';
    const params = [];

    if (searchParams.get('category')) {
      sql += ' AND category = ?';
      params.push(searchParams.get('category'));
    }

    sql += ' ORDER BY display_order ASC, id DESC';
    if (searchParams.get('limit')) {
      sql += ' LIMIT ?';
      params.push(parseInt(searchParams.get('limit')));
    }

    const items = db.prepare(sql).all(...params);
    return sendJSON(res, 200, { data: items });
  }

  if (pathname === '/api/gallery' && method === 'POST') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    if (!body.title || !body.image_url) {
      return sendJSON(res, 400, { error: 'Judul dan URL foto wajib diisi.' });
    }

    const result = db.prepare(`
      INSERT INTO gallery_images (title, category, image_url, description, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.title,
      body.category || 'venue',
      body.image_url,
      body.description || '',
      body.is_featured ? 1 : 0,
      body.is_published !== undefined ? body.is_published : 1,
      body.display_order || 0
    );

    return sendJSON(res, 201, { message: 'Foto galeri berhasil disimpan.', id: result.lastInsertRowid });
  }

  if (pathname.match(/^\/api\/gallery\/\d+$/) && method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
    return sendJSON(res, 200, { message: 'Foto berhasil dihapus.' });
  }

  // 9. TESTIMONIALS
  if (pathname === '/api/testimonials' && method === 'GET') {
    const isAuth = authenticate(req);
    const sql = isAuth
      ? 'SELECT * FROM testimonials ORDER BY id DESC'
      : 'SELECT * FROM testimonials WHERE is_published = 1 ORDER BY id DESC';
    const items = db.prepare(sql).all();
    return sendJSON(res, 200, { data: items });
  }

  if (pathname === '/api/testimonials' && method === 'POST') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const body = await parseBody(req);
    const result = db.prepare(`
      INSERT INTO testimonials (customer_name, customer_role_or_event, quote, rating, event_date, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      body.customer_name,
      body.customer_role_or_event || '',
      body.quote,
      body.rating || 5,
      body.event_date || '',
      body.is_published !== undefined ? body.is_published : 1
    );

    return sendJSON(res, 201, { message: 'Testimoni berhasil disimpan.', id: result.lastInsertRowid });
  }

  if (pathname.match(/^\/api\/testimonials\/\d+$/) && method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    return sendJSON(res, 200, { message: 'Testimoni berhasil dihapus.' });
  }

  // 10. CUSTOMER INQUIRIES
  if (pathname === '/api/inquiries' && method === 'GET') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    let sql = 'SELECT * FROM inquiries WHERE 1=1';
    const params = [];

    if (searchParams.get('type')) {
      sql += ' AND inquiry_type = ?';
      params.push(searchParams.get('type'));
    }

    if (searchParams.get('status')) {
      sql += ' AND status = ?';
      params.push(searchParams.get('status'));
    }

    sql += ' ORDER BY id DESC';
    if (searchParams.get('limit')) {
      sql += ' LIMIT ?';
      params.push(parseInt(searchParams.get('limit')));
    }

    const items = db.prepare(sql).all(...params);
    return sendJSON(res, 200, { data: items });
  }

  if (pathname.match(/^\/api\/inquiries\/\d+$/) && method === 'GET') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    const inq = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    if (!inq) return sendJSON(res, 404, { error: 'Inquiry tidak ditemukan.' });
    return sendJSON(res, 200, { data: inq });
  }

  if (pathname === '/api/inquiries' && method === 'POST') {
    // PUBLIC ENDPOINT! Visitors submit inquiry forms here
    const body = await parseBody(req);

    if (!body.customer_name || !body.whatsapp || !body.message) {
      return sendJSON(res, 400, { error: 'Nama, nomor WhatsApp, dan pesan wajib diisi.' });
    }

    const result = db.prepare(`
      INSERT INTO inquiries (inquiry_type, customer_name, whatsapp, email, event_type, event_date, guest_count, message, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', '')
    `).run(
      body.inquiry_type || 'general',
      body.customer_name,
      body.whatsapp,
      body.email || '',
      body.event_type || '',
      body.event_date || '',
      body.guest_count ? parseInt(body.guest_count) : null,
      body.message
    );

    return sendJSON(res, 201, {
      message: 'Pengajuan inquiry Anda berhasil dikirim ke pengelola Angkringan Widoro!',
      id: result.lastInsertRowid
    });
  }

  if (pathname.match(/^\/api\/inquiries\/\d+$/) && method === 'PUT') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    const body = await parseBody(req);

    db.prepare(`
      UPDATE inquiries SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(body.status || null, body.notes !== undefined ? body.notes : null, id);

    return sendJSON(res, 200, { message: 'Status/catatan inquiry berhasil diperbarui.' });
  }

  if (pathname.match(/^\/api\/inquiries\/\d+$/) && method === 'DELETE') {
    const auth = authenticate(req);
    if (!auth) return sendJSON(res, 401, { error: 'Tidak memiliki izin.' });

    const id = parseInt(pathname.split('/').pop());
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    return sendJSON(res, 200, { message: 'Inquiry berhasil dihapus.' });
  }

  // Not found for unknown API route
  return sendJSON(res, 404, { error: `Endpoint API ${pathname} tidak ditemukan.` });
}

// ========================================================
// HTTP SERVER & STATIC FILE DISPATCHER
// ========================================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. API Routes
  if (pathname.startsWith('/api')) {
    return handleApiRequest(req, res, parsedUrl);
  }

  // 2. Static File Handling
  let filePath = path.join(PUBLIC_DIR, pathname);

  // Normalize path
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallbacks for Clean SPA Routing
  if (!fs.existsSync(filePath)) {
    if (pathname.startsWith('/admin')) {
      filePath = path.join(PUBLIC_DIR, 'admin', 'index.html');
    } else {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  // Determine MIME type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('500 Internal Server Error: Gagal membaca berkas.');
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    res.end(content);
  });
});

// Start Server
initDatabase();
server.listen(PORT, () => {
  console.log(`
  ==============================================================
  🏛️  ANGKRINGAN WIDORO ("Nguliner Neng Kebon") — FULL-STACK APP
  ==============================================================
  🚀 Server Aktif di: http://localhost:${PORT}
  
  🌐 Antarmuka Publik:
     • Beranda        : http://localhost:${PORT}/
     • Tentang Kami   : http://localhost:${PORT}/about
     • Restoran & Menu: http://localhost:${PORT}/restaurant
     • Wedding Venue  : http://localhost:${PORT}/wedding-venue
     • Galeri Foto    : http://localhost:${PORT}/gallery
     • Kontak & Lokasi: http://localhost:${PORT}/contact

  🔐 Antarmuka Pengelola (Admin CMS):
     • Login Admin    : http://localhost:${PORT}/admin/login
     • Dashboard      : http://localhost:${PORT}/admin/dashboard
     • Kredensial     : admin@angkringanwidoro.com / adminwidoro123
  ==============================================================
  `);
});
