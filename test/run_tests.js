const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

console.log('🧪 MENJALANKAN PENGUJIAN INTEGRASI LENGKAP ANGKRINGAN WIDORO...\n');

// 1. Verifikasi File HTML, CSS, JS
const requiredFiles = [
  'public/index.html',
  'public/admin/index.html',
  'public/css/variables.css',
  'public/css/public.css',
  'public/css/admin.css',
  'public/js/api.js',
  'public/js/public.js',
  'public/js/admin.js',
  'public/images/logo.svg',
  'public/images/batik-pattern.svg',
  'server.js',
  'schema.sql',
  'wrangler.toml',
  'functions/api/[[path]].js'
];

for (const f of requiredFiles) {
  const fullPath = path.join(__dirname, '..', f);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File hilang: ${f}`);
  }
  console.log(`✅ File terverifikasi: ${f}`);
}

// 2. Verifikasi Database SQLite & Data Seeding
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const db = new DatabaseSync(dbPath);

const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get('admin@angkringanwidoro.com');
if (!admin) throw new Error('Admin default tidak ditemukan!');
console.log(`✅ Admin terverifikasi: ${admin.email} (Role: ${admin.role})`);

// Verifikasi password hashing
const testHash = crypto.pbkdf2Sync('adminwidoro123', admin.salt, 10000, 64, 'sha512').toString('hex');
if (testHash !== admin.password_hash) throw new Error('Password hashing tidak cocok!');
console.log('✅ Verifikasi autentikasi password PBKDF2: Berhasil!');

// 3. Verifikasi Menu Items
const menuCount = db.prepare('SELECT count(*) as count FROM menu_items').get().count;
console.log(`✅ Total Item Menu di Database: ${menuCount}`);
if (menuCount < 10) throw new Error('Menu items kurang!');

const sotoKerbau = db.prepare("SELECT * FROM menu_items WHERE name LIKE '%Soto Kerbau%'").get();
if (!sotoKerbau) throw new Error('Menu ikonik Soto Kerbau tidak ada!');
console.log(`✅ Menu Signature terverifikasi: ${sotoKerbau.name} (Harga: Rp ${sotoKerbau.price.toLocaleString('id-ID')})`);

// 4. Verifikasi Paket Pernikahan (Wedding Packages)
const packages = db.prepare('SELECT * FROM wedding_packages').all();
console.log(`✅ Total Paket Pernikahan: ${packages.length}`);
for (const p of packages) {
  console.log(`   • ${p.name} — Rp ${p.price.toLocaleString('id-ID')} (${p.pax} Pax)`);
}

// 5. Verifikasi Fasilitas Venue
const facilities = db.prepare('SELECT * FROM venue_facilities').all();
console.log(`✅ Total Fasilitas Venue: ${facilities.length}`);

// 6. Pengujian CRUD Menu Tambahan
const testInsert = db.prepare(`
  INSERT INTO menu_items (category_id, name, slug, description, price, price_confirmed, image_url, is_signature, is_published)
  VALUES (1, 'Nasi Langgi Komplit Test', 'nasi-langgi-test', 'Menu uji coba', 20000, 1, '', 0, 1)
`).run();
const newId = testInsert.lastInsertRowid;
console.log(`✅ Test CREATE Menu baru ID: ${newId}`);

// Update
db.prepare('UPDATE menu_items SET price = 22000 WHERE id = ?').run(newId);
const updatedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(newId);
if (updatedItem.price !== 22000) throw new Error('Gagal update menu item!');
console.log(`✅ Test UPDATE Menu ID ${newId}: Harga terupdate menjadi Rp 22.000`);

// Delete
db.prepare('DELETE FROM menu_items WHERE id = ?').run(newId);
const deletedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(newId);
if (deletedItem) throw new Error('Gagal delete menu item!');
console.log(`✅ Test DELETE Menu ID ${newId}: Berhasil dihapus`);

// 7. Pengujian Pengajuan Inquiry Pengunjung
const inqInsert = db.prepare(`
  INSERT INTO inquiries (inquiry_type, customer_name, whatsapp, email, event_type, event_date, guest_count, message, status)
  VALUES ('wedding', 'Bram & Sekar Wedding Test', '081299887766', 'test@gmail.com', 'Pernikahan (Wedding)', '2025-09-20', 350, 'Tes pesan inquiry wedding', 'new')
`).run();
const inqId = inqInsert.lastInsertRowid;
console.log(`✅ Test CREATE Pengajuan Inquiry ID: ${inqId}`);

// Update status to responded
db.prepare("UPDATE inquiries SET status = 'responded', notes = 'Sudah dihubungi via WA' WHERE id = ?").run(inqId);
const inqUpdated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(inqId);
if (inqUpdated.status !== 'responded') throw new Error('Gagal update inquiry status!');
console.log(`✅ Test UPDATE Status Inquiry ID ${inqId}: Menjadi '${inqUpdated.status}' dengan catatan: '${inqUpdated.notes}'`);

// Clean up test inquiry
db.prepare('DELETE FROM inquiries WHERE id = ?').run(inqId);

console.log('\n🎉 SELURUH PENGUJIAN INTEGRASI BERHASIL 100%! SISTEM SIAP DIGUNAKAN!');
