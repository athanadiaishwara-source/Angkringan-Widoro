// ========================================================
// DATABASE SEEDER: ANGKRINGAN WIDORO & WEDDING VENUE
// ========================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, 'database.sqlite');
const schemaPath = path.join(__dirname, '..', 'schema.sql');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function runSeed() {
  console.log('🌱 Menyiapkan database SQLite...');
  
  // Ensure data dir exists
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  
  // Execute schema
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✅ Skema tabel berhasil diinisialisasi.');

  // 1. Admin Users
  const checkAdmin = db.prepare('SELECT count(*) as count FROM admin_users').get();
  if (checkAdmin.count === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('adminwidoro123', salt);
    
    db.prepare(`
      INSERT INTO admin_users (email, password_hash, salt, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin@angkringanwidoro.com', hash, salt, 'Pengelola Angkringan Widoro', 'owner');
    console.log('👤 Admin default dibuat: admin@angkringanwidoro.com / adminwidoro123');
  }

  // 2. Website Content (CMS)
  const contentList = [
    {
      section_key: 'hero',
      title: 'Dimana Tradisi Bertemu Setiap Momen Berharga',
      subtitle: 'Nikmati kehangatan cita rasa kuliner Jawa autentik dan rayakan momen istimewa Anda di pelukan keasrian Javanese Heritage.',
      content: 'Selamat datang di Angkringan Widoro, tempat di mana rasa, budaya, dan kenangan berpadu indah di bawah naungan Joglo dan rindangnya kebon Klaten.',
      metadata_json: JSON.stringify({
        tagline: 'Nguliner Neng Kebon',
        sub_tagline: 'A Taste of Tradition, A Place for Memories',
        cta_restaurant_text: 'Jelajahi Menu & Restoran',
        cta_restaurant_link: '/restaurant',
        cta_wedding_text: 'Temukan Wedding Venue',
        cta_wedding_link: '/wedding-venue',
        hero_badge: 'Javanese Heritage • Nguliner Neng Kebon'
      })
    },
    {
      section_key: 'about',
      title: 'Kisah Angkringan Widoro: Dari Tradisi Menjadi Ruang Hangat Penuh Kenangan',
      subtitle: 'Harmoni Kelezatan Resep Nusantara dan Kesejukan Alam Terbuka di Cantelan, Klaten',
      content: 'Angkringan Widoro merupakan salah satu usaha mikro, kecil, dan menengah (UMKM) kuliner kebanggaan yang berlokasi di Cantelan, Desa Ketandan, Kecamatan Klaten Utara, Kabupaten Klaten, Jawa Tengah, tepatnya di belakang Pabrik Vanili.\n\nDengan mengusung tagline "Nguliner Neng Kebon", kami menghadirkan konsep kuliner bernuansa alam yang asri, sejuk, dan santai. Berbeda dengan angkringan pada umumnya yang sempit di pinggir jalan, Angkringan Widoro memiliki area kebon yang sangat luas, bangunan Joglo Jawa terbuka dari kayu jati kokoh, serta pepohonan hijau rindang yang memberikan ketenangan dan kenyamanan optimal bagi setiap pengunjung.\n\nKami melestarikan warisan rasa tradisional mulai dari nasi bungkus daun, aneka sate rempah, hidangan nusantara, hingga menu legendaris Soto Kerbau yang kaya rempah dan telah menjadi sorotan kuliner. Lebih dari sekadar tempat makan, Angkringan Widoro kini hadir sebagai destinasi perayaan momen terindah, mulai dari reuni, gathering komunitas, hingga resepsi pernikahan (wedding venue) bergaya Javanese Heritage yang anggun dan berkesan seumur hidup.',
      metadata_json: JSON.stringify({
        established_year: '2021',
        location_short: 'Cantelan, Ketandan, Klaten Utara',
        vision: 'Menjadi destinasi kuliner dan ruang perayaan warisan budaya Jawa nomor satu di Klaten yang memadukan keasrian alam dan keramahtamahan sejati.',
        mission: [
          'Menyajikan kuliner khas Jawa dan Nusantara berstandar tinggi dengan bahan segar dan rempah alami.',
          'Menyediakan ruang berkumpul dan venue acara yang luas, nyaman, asri, dan sarat nilai estetika budaya.',
          'Memberikan pelayanan ramah, hangat, dan profesional dengan kearifan lokal keraton Jawa.'
        ]
      })
    },
    {
      section_key: 'restaurant_intro',
      title: 'Cita Rasa Tradisi, Nuansa Kebon Rindang',
      subtitle: 'Sensasi Kuliner Angkringan Nusantara dengan Standar Kualitas Restoran',
      content: 'Di Angkringan Widoro, setiap sajian diracik dengan dedikasi dan resep warisan leluhur. Kami menghadirkan aneka pilihan makanan mulai dari hidangan khas angkringan yang akrab di lidah, aneka olahan nasi lauk lengkap, gorengan krispi panas, hingga menu ikonik kami: Soto Kerbau berkuah kaldu gurih rempah pilihan.',
      metadata_json: JSON.stringify({
        signature_dish: 'Soto Kerbau Widoro',
        highlight_points: [
          'Menu Ikonik: Soto Kerbau rempah gurih khas tradisi',
          'Aneka Nasi Bungkus Daun Pisang & Bakar Kemangi',
          'Sate-Satean Angkringan Komplit Bumbu Meresap',
          'Wedangan Rempah Tradisional & Kopi Tubruk Klotok'
        ]
      })
    },
    {
      section_key: 'wedding_intro',
      title: 'Tempat Indah untuk Merayakan Hari Istimewa Anda',
      subtitle: 'Wujudkan Pernikahan Impian Bergaya Javanese Heritage di Bawah Naungan Joglo dan Rimbun Pepohonan',
      content: 'Hari pernikahan adalah salah satu babak terindah dalam lembaran hidup Anda. Angkringan Widoro menawarkan perpaduan sempurna antara kemegahan arsitektur Joglo kayu jati klasik dengan lanskap kebon alami yang asri dan sejuk. Suasana hangat, pencahayaan temaram romantis di malam hari, serta semilir angin kebon menciptakan latar magis yang abadi untuk mengikat janji suci dan merayakan kebersamaan bersama orang-orang tercinta.',
      metadata_json: JSON.stringify({
        capacity_summary: 'Kapasitas hingga 600 tamu (Area Joglo Semi-Indoor & Kebon Terbuka)',
        decor_style: 'Modern Javanese Heritage & Rustic Garden Party',
        inquiry_tagline: 'Konsultasikan tanggal spesial Anda bersama wedding specialist Angkringan Widoro'
      })
    },
    {
      section_key: 'contact_info',
      title: 'Kunjungi & Hubungi Kami',
      subtitle: 'Pintu Angkringan Widoro Selalu Terbuka Menyambut Kedatangan Anda',
      content: 'Kami berlokasi di lokasi yang tenang, bebas hiruk-pikuk macet perkotaan, dan mudah diakses oleh kendaraan roda dua maupun mobil rombongan.',
      metadata_json: JSON.stringify({
        restaurant_name: 'Angkringan Widoro',
        address: 'Cantelan, Desa Ketandan, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah (Belakang Pabrik Vanili)',
        city: 'Klaten',
        province: 'Jawa Tengah',
        postal_code: '57423',
        whatsapp: '6281234567890',
        whatsapp_display: '+62 812-3456-7890',
        instagram: '@angkringanwidoro',
        instagram_url: 'https://instagram.com/angkringanwidoro',
        email: 'info@angkringanwidoro.com',
        operating_hours_weekdays: 'Senin - Jumat: 10.00 - 22.00 WIB',
        operating_hours_weekends: 'Sabtu - Minggu: 09.00 - 23.00 WIB',
        google_maps_url: 'https://maps.google.com/?q=Angkringan+Widoro+Klaten'
      })
    }
  ];

  const insertContent = db.prepare(`
    INSERT OR REPLACE INTO website_content (section_key, title, subtitle, content, metadata_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const c of contentList) {
    insertContent.run(c.section_key, c.title, c.subtitle, c.content, c.metadata_json);
  }
  console.log('📝 Konten CMS berhasil diperbarui.');

  // 3. Menu Categories
  const checkCat = db.prepare('SELECT count(*) as count FROM menu_categories').get();
  if (checkCat.count === 0) {
    const categories = [
      { id: 1, name: 'Makanan Utama', slug: 'makanan-utama', display_order: 1 },
      { id: 2, name: 'Camilan & Sate Angkringan', slug: 'camilan-sate', display_order: 2 },
      { id: 3, name: 'Hidangan Pembuka & Gorengan', slug: 'hidangan-pembuka', display_order: 3 },
      { id: 4, name: 'Minuman Tradisional & Kopi', slug: 'minuman-tradisional-kopi', display_order: 4 },
      { id: 5, name: 'Hidangan Penutup', slug: 'hidangan-penutup', display_order: 5 }
    ];

    const insertCat = db.prepare('INSERT INTO menu_categories (id, name, slug, display_order) VALUES (?, ?, ?, ?)');
    for (const cat of categories) {
      insertCat.run(cat.id, cat.name, cat.slug, cat.display_order);
    }
    console.log('📂 5 Kategori menu ditambahkan.');
  }

  // 4. Menu Items
  const checkItems = db.prepare('SELECT count(*) as count FROM menu_items').get();
  if (checkItems.count === 0) {
    const menuItems = [
      {
        category_id: 1,
        name: 'Soto Kerbau Widoro (Signature)',
        slug: 'soto-kerbau-widoro',
        description: 'Menu andalan legendaris yang pernah menjadi sorotan media kuliner! Daging kerbau empuk tanpa prengus dipadu kaldu rempah kuning gurih bening, tauge renyah, bihun, seledri, dan bawang goreng harum.',
        price: 25000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 1
      },
      {
        category_id: 1,
        name: 'Nasi Kucing Sambal Teri Daun Pisang',
        slug: 'nasi-kucing-sambal-teri',
        description: 'Nasi pulen hangat khas angkringan dibungkus daun pisang segar dengan topping sambal teri gurih bercitarasa pedas manis yang melegenda.',
        price: 5000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 2
      },
      {
        category_id: 1,
        name: 'Nasi Bakar Cumi Kemangi Gurih',
        slug: 'nasi-bakar-cumi-kemangi',
        description: 'Nasi berbumbu rempah dan santan dengan isian oseng cumi pedas dan daun kemangi wangi, dibakar harum di atas arang batok kelapa.',
        price: 16000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 3
      },
      {
        category_id: 1,
        name: 'Ayam Bakar Madu Joglo',
        slug: 'ayam-bakar-madu-joglo',
        description: 'Ayam ungkep bumbu rempah Jawa klasik dibakar dengan olesan madu murni dan kecap manis premium, disajikan dengan lalapan segar dan sambal bajak terasi.',
        price: 28000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 4
      },
      {
        category_id: 1,
        name: 'Nasi Goreng Jawa Tradisional',
        slug: 'nasi-goreng-jawa-tradisional',
        description: 'Nasi goreng bumbu ulek bawang merah, bawang putih, ebi, dan cabai merah, disajikan dengan telur ceplok, suwiran ayam kampung, dan kerupuk.',
        price: 22000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 5
      },
      // Camilan & Sate
      {
        category_id: 2,
        name: 'Sate Telur Puyuh Kecap Manis Rempah',
        slug: 'sate-telur-puyuh',
        description: 'Tusukan telur puyuh bacem dengan bumbu gula kelapa dan ketumbar gurih legit meresap sempurna hingga ke kuning telur.',
        price: 4500,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 6
      },
      {
        category_id: 2,
        name: 'Sate Usus Ayam Bumbu Kuning',
        slug: 'sate-usus-ayam',
        description: 'Sate usus bersih empuk dibumbui kunyit dan serai wangi, dipanggang sebentar untuk aroma bakaran yang menggugah selera.',
        price: 4000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 7
      },
      {
        category_id: 2,
        name: 'Sate Kulit Ayam Crispy Bakar',
        slug: 'sate-kulit-ayam',
        description: 'Kulit ayam krispi gurih dengan olesan bumbu bakar manis gurih yang membuat ketagihan.',
        price: 4000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 8
      },
      // Pembuka & Gorengan
      {
        category_id: 3,
        name: 'Tempe Mendoan Anget Sambal Kecap',
        slug: 'tempe-mendoan-anget',
        description: 'Tempe berbalut adonan tepung beras dan daun bawang gurih lembut khas Banyumasan, digoreng setengah matang disajikan dengan cabai rawit hijau dan sambal kecap pedas.',
        price: 12000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 9
      },
      {
        category_id: 3,
        name: 'Bakwan Sayur Kebon Renyah',
        slug: 'bakwan-sayur-kebon',
        description: 'Gorengan bakwan renyah dengan isian sayur mayur segar (wortel, kubis, seledri), kriuk gurih pas untuk teman santai neng kebon.',
        price: 10000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 10
      },
      // Minuman
      {
        category_id: 4,
        name: 'Wedang Uwuh Komplit Gula Batu',
        slug: 'wedang-uwuh-komplit',
        description: 'Racikan kayu secang merah, jahe emprit geprek, cengkeh, kapulaga, serai, daun kayu manis, dan gula batu asli. Hangat, wangi, menyehatkan tubuh.',
        price: 10000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 11
      },
      {
        category_id: 4,
        name: 'Kopi Klotok Gula Aren Cangkir Blirik',
        slug: 'kopi-klotok-gula-aren',
        description: 'Kopi robusta Jawa dimasak tradisional dengan metode klotok (direbus bersama air hingga berbusa tebal), disajikan dengan cangkir blirik seng klasik dan pemanis gula aren.',
        price: 10000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 12
      },
      {
        category_id: 4,
        name: 'Es Beras Kencur Segar Widoro',
        slug: 'es-beras-kencur-segar',
        description: 'Jamu beras kencur alami racikan sendiri beraroma kencur segar dan asam jawa, disajikan dingin dengan es batu kristal. Segar dan melegakan tenggorokan.',
        price: 10000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 13
      },
      // Penutup
      {
        category_id: 5,
        name: 'Pisang Bakar Cokelat Keju Gula Palem',
        slug: 'pisang-bakar-cokelat-keju',
        description: 'Pisang kepok matang pohon dipanggang wangi berkaramel, diberi taburan keju cheddar parut melimpah, meses cokelat Belanda, dan susu kental manis.',
        price: 15000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
        is_signature: 0,
        is_published: 1,
        display_order: 14
      },
      {
        category_id: 5,
        name: 'Es Dawet Nangka Gula Kelapa Asli',
        slug: 'es-dawet-nangka',
        description: 'Cendol lembut wangi daun suji berpadu santan kelapa gurih segar, kinca gula kelapa Klaten kental, dan potongan buah nangka harum manis.',
        price: 12000,
        price_confirmed: 1,
        image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
        is_signature: 1,
        is_published: 1,
        display_order: 15
      }
    ];

    const insertItem = db.prepare(`
      INSERT INTO menu_items (category_id, name, slug, description, price, price_confirmed, image_url, is_signature, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of menuItems) {
      insertItem.run(
        item.category_id,
        item.name,
        item.slug,
        item.description,
        item.price,
        item.price_confirmed,
        item.image_url,
        item.is_signature,
        item.is_published,
        item.display_order
      );
    }
    console.log('🍲 15 Item menu otentik berhasil ditambahkan.');
  }

  // 5. Venue Info
  const checkVenue = db.prepare('SELECT count(*) as count FROM venue_info').get();
  if (checkVenue.count === 0) {
    db.prepare(`
      INSERT INTO venue_info (name, tagline, description, capacity_seated, capacity_standing, indoor_area_desc, outdoor_area_desc, hero_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Widoro Heritage Joglo & Garden Venue',
      'Merayakan Momen Abadi di Bawah Naungan Joglo Jawa dan Keasrian Kebon Klaten',
      'Angkringan Widoro menyediakan ruang perayaan pesta pernikahan dan acara istimewa yang memadukan keindahan arsitektur Joglo kayu jati klasik dengan lanskap kebon terbuka yang asri dan hijau. Terletak di Cantelan, Ketandan, Klaten Utara (belakang Pabrik Vanili), venue ini menawarkan suasana tenang, privasi tinggi, serta akses mudah dan parkir luas.',
      350,
      600,
      'Bangunan Joglo utama kayu jati bertiang sokoguru megah dengan ventilasi terbuka yang teduh, sangat anggun untuk pelaminan tradisi maupun modern rustic.',
      'Halaman kebon rumput alami seluas lebih dari 1.500 m2 dengan kanopi pepohonan rindang dan instalasi tata lampu temaram romantis untuk resepsi malam hari.',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80'
    );
    console.log('🏛️ Informasi venue pernikahan berhasil dibuat.');
  }

  // 6. Venue Facilities
  const checkFac = db.prepare('SELECT count(*) as count FROM venue_facilities').get();
  if (checkFac.count === 0) {
    const facilities = [
      { name: 'Bangunan Joglo Utama Kayu Jati', description: 'Arsitektur Joglo Jawa autentik dengan sokoguru megah dan atap tinggi yang sejuk alami.', icon: 'home', is_available: 1, display_order: 1 },
      { name: 'Area Kebon Terbuka Rindang (Garden Area)', description: 'Lanskap rumput hijau asri dinaungi pepohonan rindang seluas 1.500+ m2 untuk pesta outdoor.', icon: 'tree', is_available: 1, display_order: 2 },
      { name: 'Kapasitas Luas hingga 600 Tamu', description: 'Fleksibel untuk konsep resepsi standing party 600 pax atau round-table seated 350 pax.', icon: 'users', is_available: 1, display_order: 3 },
      { name: 'Ruang Rias Pengantin & Keluarga Ber-AC', description: 'Kamar rias privat bersih berpenyejuk udara dilengkapi cermin rias dan toilet dalam.', icon: 'sparkles', is_available: 1, display_order: 4 },
      { name: 'Panggung Pelaminan & Mini Stage Akustik', description: 'Area panggung kokoh siap dekorasi untuk pelaminan adat Jawa, modern rustic, maupun hiburan live music.', icon: 'music', is_available: 1, display_order: 5 },
      { name: 'Sound System & Penerangan Romantis', description: 'Sistem tata suara jernih untuk prosesi akad nikah dan instalasi fairy lights kebon malam hari.', icon: 'mic', is_available: 1, display_order: 6 },
      { name: 'Area Parkir Luas & Petugas Keamanan', description: 'Lahan parkir memadai untuk puluhan mobil dan ratusan sepeda motor dengan penjagaan penuh.', icon: 'shield', is_available: 1, display_order: 7 },
      { name: 'Mushola Bersih & Toilet Nyaman', description: 'Fasilitas ibadah mushola yang tenang serta toilet representatif terawat untuk kenyamanan tamu.', icon: 'check-circle', is_available: 1, display_order: 8 },
      { name: 'Layanan Katering Tradisional & Nusantara', description: 'Pilihan hidangan prasmanan lezat, live cooking gubukan Soto Kerbau, dan wedangan hangat.', icon: 'coffee', is_available: 1, display_order: 9 }
    ];

    const insertFac = db.prepare('INSERT INTO venue_facilities (name, description, icon, is_available, display_order) VALUES (?, ?, ?, ?, ?)');
    for (const f of facilities) {
      insertFac.run(f.name, f.description, f.icon, f.is_available, f.display_order);
    }
    console.log('✨ 9 Fasilitas venue ditambahkan.');
  }

  // 7. Wedding Packages
  const checkPack = db.prepare('SELECT count(*) as count FROM wedding_packages').get();
  if (checkPack.count === 0) {
    const packages = [
      {
        name: 'Paket Joglo Asri (Intimate Wedding 100 Pax)',
        slug: 'paket-joglo-asri',
        price: 18500000,
        pax: 100,
        description: 'Sempurna untuk acara pernikahan intim, lamaran resmi, atau akad nikah khidmat bersama keluarga inti dan sahabat terdekat.',
        inclusions_json: JSON.stringify([
          'Penggunaan Joglo Utama selama 5 Jam',
          'Buffet Prasmanan Mewah untuk 100 Pax (5 Menu Utama + Sup + Buah + Minuman)',
          '1 Gubukan Tradisional Pilihan (Wedangan Rempah & Aneka Gorengan Panas)',
          'Dekorasi Pelaminan Minimalis Heritage / Rustic Joglo (Lebar 4-6 meter)',
          'Ruang Rias Pengantin Ber-AC',
          'Sound System Standard & 2 Wireless Mic',
          'Meja Penerima Tamu & Buku Tamu Eksklusif',
          'Area Parkir Khusus Keluarga'
        ]),
        is_featured: 0,
        is_active: 1,
        display_order: 1
      },
      {
        name: 'Paket Kebon Widoro (Garden & Joglo Heritage 250 Pax)',
        slug: 'paket-kebon-widoro',
        price: 38000000,
        pax: 250,
        description: 'Paket terfavorit! Memadukan pesona Joglo klasik dan keindahan taman kebon terbuka dengan dekorasi hangat bernuansa budaya.',
        inclusions_json: JSON.stringify([
          'Penggunaan Area Joglo dan Seluruh Kebon Terbuka selama 6 Jam',
          'Buffet Prasmanan Lengkap untuk 250 Pax (6 Menu Utama + 2 Pilihan Sup + Dessert)',
          '2 Gubukan Spesial: Soto Kerbau Widoro (100 Porsi) & Es Dawet Nangka (150 Porsi)',
          'Dekorasi Pelaminan Modern Javanese Heritage (Lebar 6-8 meter) dengan Bunga Segar',
          'Dekorasi Photobooth Heritage & Welcome Gate Masuk Kayu Jati',
          'Tata Lampu Gantung Kebon (Fairy Lights Garden & Spotlights Joglo)',
          '2 Ruang Rias (Pengantin & Keluarga) Ber-AC',
          'Sound System 3.000 Watt + Operator Standby',
          'Panggung Akustik / Hiburan & Kursi Tamu + Cover',
          'Tim Pengatur Parkir & Keamanan Dedikasi'
        ]),
        is_featured: 1,
        is_active: 1,
        display_order: 2
      },
      {
        name: 'Paket Ageng Widoro (Grand Heritage Celebration 500 Pax)',
        slug: 'paket-ageng-widoro',
        price: 68000000,
        pax: 500,
        description: 'Perayaan agung pesta pernikahan adat Jawa atau modern heritage dengan fasilitas menyeluruh dan kenyamanan maksimal untuk seluruh tamu kehormatan.',
        inclusions_json: JSON.stringify([
          'Penggunaan Seluruh Kompleks Angkringan Widoro (Eksklusif Tutup untuk Umum)',
          'Buffet Prasmanan Royal Heritage untuk 500 Pax (Pilihan Masakan Nusantara & Jawa Kraton)',
          '4 Gubukan Eksklusif Termasuk Soto Kerbau Widoro (200 Porsi), Sate Ayam/Kambing, Siomay, & Aneka Wedangan',
          'Dekorasi Pelaminan Ageng Mewah Adat Jawa / Luxury Rustic dengan Rangkaian Bunga Segar Penuh',
          'Dekorasi Lengkap: Lorong Masuk Adat, Photobooth Premium, Pergola Bunga, dan Meja VIP',
          'Pencahayaan Artistik Temaram Romantis (Fairy Lights + Ambience Par LED)',
          'Master of Ceremony (MC) Profesional Akad & Resepsi',
          'Sound System 5.000 Watt + Panggung Live Music',
          'Ruang Rias Pengantin & Keluarga Besar Ber-AC',
          'Bantuan Pengurusan Perizinan & Koordinasi Keamanan Lingkungan'
        ]),
        is_featured: 0,
        is_active: 1,
        display_order: 3
      },
      {
        name: 'Paket Spesial Gathering & Reuni Keluarga (50 Pax)',
        slug: 'paket-gathering-reuni',
        price: 6500000,
        pax: 50,
        description: 'Pilihan hemat dan nyaman untuk temu kangen alumni, reuni keluarga besar, arisan paguyuban, atau gathering kantor santai di tengah kebon.',
        inclusions_json: JSON.stringify([
          'Penggunaan Area Joglo Semi-Outdoor selama 4 Jam',
          'Buffet Prasmanan Khas Angkringan untuk 50 Pax',
          'Wedang Rempah Bebas Refill & Snack Gorengan Panas',
          'Sound System Standard & Mic untuk Sambutan/Karaoke',
          'Bebas Membawa Dekorasi Tambahan',
          'Parkir Nyaman & Gratis'
        ]),
        is_featured: 0,
        is_active: 1,
        display_order: 4
      }
    ];

    const insertPack = db.prepare(`
      INSERT INTO wedding_packages (name, slug, price, pax, description, inclusions_json, is_featured, is_active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of packages) {
      insertPack.run(p.name, p.slug, p.price, p.pax, p.description, p.inclusions_json, p.is_featured, p.is_active, p.display_order);
    }
    console.log('💍 4 Paket pernikahan & event ditambahkan.');
  }

  // 8. Gallery Images
  const checkGal = db.prepare('SELECT count(*) as count FROM gallery_images').get();
  if (checkGal.count === 0) {
    const galleryItems = [
      {
        title: 'Megahnya Bangunan Joglo Utama Kayu Jati',
        category: 'interior',
        image_url: 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80',
        description: 'Struktur kayu jati ukir tradisional dengan tiang sokoguru kokoh yang menghadirkan aura wibawa dan ketenangan masa silam.',
        is_featured: 1,
        is_published: 1,
        display_order: 1
      },
      {
        title: 'Soto Kerbau Widoro Kuah Rempah Legendaris',
        category: 'food',
        image_url: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=1200&q=80',
        description: 'Menu ikonik khas Angkringan Widoro dengan irisan daging kerbau empuk bertabur bawang goreng dan kuah kaldu rempah hangat.',
        is_featured: 1,
        is_published: 1,
        display_order: 2
      },
      {
        title: 'Suasana Nyaman "Nguliner Neng Kebon"',
        category: 'atmosphere',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        description: 'Meja-meja kayu alami di bawah kanopi pepohonan rindang, tempat santap santai bersama keluarga dan rekan sejawat.',
        is_featured: 1,
        is_published: 1,
        display_order: 3
      },
      {
        title: 'Dekorasi Pelaminan Romantis di Area Joglo',
        category: 'wedding',
        image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        description: 'Sentuhan bunga-bunga segar putih pastel berpadu hangat dengan serat kayu jati Joglo menghadirkan kesan agung dan sakral.',
        is_featured: 1,
        is_published: 1,
        display_order: 4
      },
      {
        title: 'Tata Lampu Fairy Lights Kebon di Malam Hari',
        category: 'venue',
        image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        description: 'Pemandangan magis pesta kebon malam hari dihiasi kilau lampu temaram di antara dahan pepohonan.',
        is_featured: 1,
        is_published: 1,
        display_order: 5
      },
      {
        title: 'Pilihan Sate-Satean Angkringan Komplit',
        category: 'food',
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
        description: 'Sate telur puyuh, sate usus, dan sate kulit ayam dengan bumbu kecap rempah bacem manis legit.',
        is_featured: 0,
        is_published: 1,
        display_order: 6
      },
      {
        title: 'Resepsi Outdoor Syahdu di Halaman Rumput',
        category: 'wedding',
        image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
        description: 'Perayaan pernikahan berkonsep garden party yang leluasa, sejuk, dan akrab bagi para tamu undangan.',
        is_featured: 0,
        is_published: 1,
        display_order: 7
      },
      {
        title: 'Wedang Uwuh Hangat Khas Tradisi Kraton',
        category: 'food',
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
        description: 'Minuman seduhan rempah komplit dengan rona merah kayu secang dan gula batu alami penghangat badan.',
        is_featured: 0,
        is_published: 1,
        display_order: 8
      },
      {
        title: 'Detail Ukiran Jepara pada Tiang Sokoguru',
        category: 'interior',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        description: 'Keindahan seni kriya kayu warisan leluhur yang dirawat dengan penuh ketelitian dan cinta estetika.',
        is_featured: 0,
        is_published: 1,
        display_order: 9
      }
    ];

    const insertGal = db.prepare(`
      INSERT INTO gallery_images (title, category, image_url, description, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const g of galleryItems) {
      insertGal.run(g.title, g.category, g.image_url, g.description, g.is_featured, g.is_published, g.display_order);
    }
    console.log('🖼️ 9 Foto galeri beresolusi tinggi ditambahkan.');
  }

  // 9. Testimonials
  const checkTest = db.prepare('SELECT count(*) as count FROM testimonials').get();
  if (checkTest.count === 0) {
    const testimonials = [
      {
        customer_name: 'Aditya Pratama & Dian Larasati',
        customer_role_or_event: 'Pengantin Resepsi Pernikahan (Paket Kebon Widoro)',
        quote: 'Pernikahan kami di Angkringan Widoro benar-benar seperti di negeri dongeng Jawa. Suasana Joglonya megah tapi tetap hangat, halaman kebonnya rindang sekali, dan tamu-tamu kami tidak henti-hentinya memuji kelezatan Soto Kerbau dan gubukan wedangannya. Pelayanan pengelolanya sangat ramah dan kooperatif!',
        rating: 5,
        event_date: 'Oktober 2024',
        is_published: 1
      },
      {
        customer_name: 'Bambang Sudibyo, S.E.',
        customer_role_or_event: 'Koordinator Reuni Alumni SMA 1 Klaten',
        quote: 'Tempat paling pas di Klaten untuk kumpul ramai-ramai! Konsep "Nguliner Neng Kebon" bikin suasana santai dan tidak kaku. Area parkir sangat lapang, musholanya bersih, dan menu makanannya variatif dari yang murah meriah khas angkringan sampai hidangan berat yang nikmat.',
        rating: 5,
        event_date: 'November 2024',
        is_published: 1
      },
      {
        customer_name: 'Ratna Ayu Kusuma',
        customer_role_or_event: 'Pelanggan Kuliner Keluarga (Solo)',
        quote: 'Jauh-jauh dari Solo sengaja mampir ke Cantelan Klaten demi mencicipi Soto Kerbaunya. Kuahnya benar-benar gurih rempah asli, dagingnya empuk banget. Anak-anak juga betah karena tempatnya luas, ada kebon asri, suasananya sejuk tidak gerah sama sekali.',
        rating: 5,
        event_date: 'Desember 2024',
        is_published: 1
      }
    ];

    const insertTest = db.prepare(`
      INSERT INTO testimonials (customer_name, customer_role_or_event, quote, rating, event_date, is_published)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const t of testimonials) {
      insertTest.run(t.customer_name, t.customer_role_or_event, t.quote, t.rating, t.event_date, t.is_published);
    }
    console.log('⭐ 3 Testimoni terverifikasi ditambahkan.');
  }

  // 10. Sample Inquiries
  const checkInq = db.prepare('SELECT count(*) as count FROM inquiries').get();
  if (checkInq.count === 0) {
    const inquiries = [
      {
        inquiry_type: 'wedding',
        customer_name: 'Bramantyo Wicaksono & Sekar Kinanthi',
        whatsapp: '081298765432',
        email: 'bram.wicaksono@gmail.com',
        event_type: 'Pernikahan (Wedding)',
        event_date: '2025-08-16',
        guest_count: 250,
        message: 'Halo Pengelola Angkringan Widoro, kami tertarik dengan Paket Kebon Widoro untuk rencana pernikahan di tanggal 16 Agustus 2025. Ingin konsultasi apakah tanggal tersebut masih tersedia dan bagaimana prosedur survei lokasi? Terima kasih.',
        status: 'new',
        notes: 'Calon pengantin dari Klaten Utara. Tertarik konsep perpaduan Joglo & Garden night.'
      },
      {
        inquiry_type: 'wedding',
        customer_name: 'Dimas Kurniawan',
        whatsapp: '082133445566',
        email: 'dimas.kurnia@yahoo.com',
        event_type: 'Lamaran / Tunangan',
        event_date: '2025-05-10',
        guest_count: 80,
        message: 'Selamat siang, kami merencanakan acara tunangan keluarga besar sekitar 80 orang di Joglo utama. Mohon info paket buffet dan sound system yang cocok.',
        status: 'in_review',
        notes: 'Sudah dihubungi via WA, menunggu konfirmasi susunan acara keluarga.'
      },
      {
        inquiry_type: 'general',
        customer_name: 'Hj. Siti Rahayu',
        whatsapp: '085712345678',
        email: 'siti.rahayu@outlook.com',
        event_type: 'Reuni / Arisan Keluarga',
        event_date: '2025-04-20',
        guest_count: 40,
        message: 'Mohon info pemesanan meja panjang untuk arisan trah keluarga besar hari Minggu siang. Apakah bisa request menu khusus Soto Kerbau dan Es Dawet?',
        status: 'responded',
        notes: 'Sudah dikonfirmasi siap dilayani di area Joglo sayap timur.'
      }
    ];

    const insertInq = db.prepare(`
      INSERT INTO inquiries (inquiry_type, customer_name, whatsapp, email, event_type, event_date, guest_count, message, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const inq of inquiries) {
      insertInq.run(
        inq.inquiry_type,
        inq.customer_name,
        inq.whatsapp,
        inq.email,
        inq.event_type,
        inq.event_date,
        inq.guest_count,
        inq.message,
        inq.status,
        inq.notes
      );
    }
    console.log('📬 3 Data pengajuan inquiry awal ditambahkan untuk pengujian admin.');
  }

  console.log('🎉 Seeding database Angkringan Widoro selesai dengan sukses!');
}

runSeed();
