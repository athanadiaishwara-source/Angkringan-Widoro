// ========================================================
// PUBLIC USER INTERFACE JAVASCRIPT: ANGKRINGAN WIDORO
// Client-Side Routing, Dynamic Data Fetching & Interactive Components
// ========================================================

const PublicApp = {
  currentPath: window.location.pathname,
  cachedData: {},

  init() {
    this.setupNavigation();
    this.setupLightbox();
    this.renderPage(this.currentPath);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.renderPage(this.currentPath);
    });
  },

  setupNavigation() {
    // Intercept clicks on internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('/admin') && !href.startsWith('/api') && !link.hasAttribute('target')) {
        e.preventDefault();
        this.navigateTo(href);
      }
    });

    // Mobile nav toggle
    const toggleBtn = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }

    // Header scroll background
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  },

  navigateTo(path) {
    if (path === this.currentPath) return;
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.renderPage(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile nav if open
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('mobile-open');
  },

  updateActiveNav(path) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => {
      const href = l.getAttribute('href');
      if (href === path || (path !== '/' && href !== '/' && path.startsWith(href))) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  },

  async renderPage(path) {
    this.updateActiveNav(path);
    const contentEl = document.getElementById('main-content');
    if (!contentEl) return;

    // Show smooth loading state
    contentEl.style.opacity = '0.5';

    try {
      if (path === '/' || path === '') {
        await this.renderHome(contentEl);
      } else if (path === '/about') {
        await this.renderAbout(contentEl);
      } else if (path === '/restaurant') {
        await this.renderRestaurant(contentEl);
      } else if (path === '/wedding-venue') {
        await this.renderWeddingVenue(contentEl);
      } else if (path === '/gallery') {
        await this.renderGallery(contentEl);
      } else if (path === '/contact') {
        await this.renderContact(contentEl);
      } else {
        await this.renderHome(contentEl);
      }
    } catch (err) {
      console.error('Error rendering page:', err);
      contentEl.innerHTML = `
        <div class="section container text-center" style="padding: 100px 20px; text-align: center;">
          <h2 class="section-title">Halaman Tidak Ditemukan</h2>
          <p>Mohon maaf, halaman yang Anda tuju sedang tidak tersedia.</p>
          <a href="/" class="btn btn-primary" style="margin-top: 20px;">Kembali ke Beranda</a>
        </div>
      `;
    } finally {
      contentEl.style.opacity = '1';
    }
  },

  // ========================================================
  // 1. HOMEPAGE
  // ========================================================
  async renderHome(container) {
    document.title = 'Angkringan Widoro — Nguliner Neng Kebon & Javanese Heritage Wedding Venue';

    // Fetch required homepage data in parallel
    const [content, menuRes, packagesRes, galleryRes, testimonialsRes] = await Promise.all([
      API.get('/content').catch(() => ({})),
      API.get('/menu?signature=1').catch(() => ({ data: [] })),
      API.get('/packages').catch(() => ({ data: [] })),
      API.get('/gallery?limit=6').catch(() => ({ data: [] })),
      API.get('/testimonials').catch(() => ({ data: [] }))
    ]);

    const hero = content.hero || {};
    const heroMeta = hero.metadata || {};
    const signatureMenus = menuRes.data || [];
    const packages = packagesRes.data || [];
    const galleryItems = galleryRes.data || [];
    const testimonials = testimonialsRes.data || [];

    container.innerHTML = `
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-background"></div>
        <div class="container hero-content">
          <div class="hero-tagline-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            ${heroMeta.tagline || 'Nguliner Neng Kebon'}
          </div>
          <h1 class="hero-title">${hero.title || 'Dimana Tradisi Bertemu Setiap Momen Berharga'}</h1>
          <p class="hero-lead">${hero.subtitle || 'Nikmati kehangatan cita rasa kuliner Jawa autentik dan rayakan momen istimewa Anda di pelukan keasrian Javanese Heritage.'}</p>
          <div class="hero-actions">
            <a href="/restaurant" class="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
              Jelajahi Menu & Restoran
            </a>
            <a href="/wedding-venue" class="btn btn-outline-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Temukan Wedding Venue
            </a>
          </div>
        </div>
      </section>

      <!-- BRAND INTRODUCTION -->
      <section class="section section-cream">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Warisan Budaya & Suasana</span>
            <h2 class="section-title">Selamat Datang di Angkringan Widoro</h2>
            <p class="section-subtitle">Kombinasi harmonis antara kehangatan tradisi kuliner Jawa, kemegahan bangunan Joglo kayu jati terbuka, dan kesegaran kebon asri rindang di Cantelan, Klaten.</p>
          </div>

          <!-- TWO MAIN EXPERIENCES -->
          <div class="experiences-grid">
            <!-- 1. Restoran & Kuliner -->
            <div class="experience-card">
              <div class="experience-img-wrap">
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" alt="Pengalaman Kuliner Angkringan Widoro" class="experience-img">
                <span class="experience-overlay-badge">Kuliner Otentik</span>
              </div>
              <div class="experience-body">
                <h3 class="experience-title font-serif">Pengalaman Santap "Nguliner Neng Kebon"</h3>
                <p class="experience-text">Nikmati sensasi bersantap santai di bawah rindangnya pepohonan dengan aneka menu tradisional khas angkringan, aneka nasi bungkus daun, sate rempah komplit, wedangan hangat, serta menu ikonik kami: <strong>Soto Kerbau Widoro</strong>.</p>
                <ul class="experience-features">
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Soto Kerbau rempah gurih khas legendaris</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Aneka nasi kucing & nasi bakar kemangi wangi</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Wedangan rempah jahe susu, kopi klotok & wedang uwuh</li>
                </ul>
                <a href="/restaurant" class="btn btn-outline">Lihat Daftar Menu Lengkap &rarr;</a>
              </div>
            </div>

            <!-- 2. Wedding & Special Events -->
            <div class="experience-card">
              <div class="experience-img-wrap">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" alt="Wedding Venue Joglo Angkringan Widoro" class="experience-img">
                <span class="experience-overlay-badge">Venue & Perayaan</span>
              </div>
              <div class="experience-body">
                <h3 class="experience-title font-serif">Destinasi Pernikahan Javanese Heritage</h3>
                <p class="experience-text">Ruang anggun dan berkesan untuk momen sakral sekali seumur hidup. Memadukan arsitektur Joglo kayu jati klasik nan megah dengan area garden terbuka bertabur kilau lampu temaram romantis berkapasitas hingga 600 tamu.</p>
                <ul class="experience-features">
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Bangunan Joglo jati asli semi-outdoor yang sejuk</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Area kebon rumput alami 1.500+ m2 untuk garden party</li>
                  <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Fasilitas lengkap: ruang rias AC, sound, katering, parkir lapang</li>
                </ul>
                <a href="/wedding-venue" class="btn btn-primary">Eksplorasi Paket Wedding Venue &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SIGNATURE MENU PREVIEW -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Pilihan Istimewa</span>
            <h2 class="section-title">Menu Ikonik & Andalan</h2>
            <p class="section-subtitle">Cicipi cita rasa otentik yang paling banyak dicari dan dinikmati para pecinta kuliner di Angkringan Widoro.</p>
          </div>

          <div class="menu-grid">
            ${signatureMenus.slice(0, 4).map(item => `
              <div class="menu-card">
                <div class="menu-img-wrap">
                  <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" alt="${item.name}" class="menu-img">
                  ${item.is_signature ? '<span class="badge-signature">Menu Ikonik</span>' : ''}
                </div>
                <div class="menu-body">
                  <span class="menu-category-tag">${item.category_name || 'Spesial Widoro'}</span>
                  <h4 class="menu-item-name font-serif">${item.name}</h4>
                  <p class="menu-desc">${item.description}</p>
                  <div class="menu-footer">
                    <span class="menu-price">${item.price_confirmed ? formatRupiah(item.price) : '<span class="menu-price-unconfirmed">Hubungi kami</span>'}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: var(--spacing-2xl);">
            <a href="/restaurant" class="btn btn-secondary">Lihat Semua Kategori Menu &rarr;</a>
          </div>
        </div>
      </section>

      <!-- WEDDING VENUE PREVIEW -->
      <section class="section section-walnut">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; align-items: center;">
            <div>
              <span class="badge-heritage">Ruang Sakral Penuh Makna</span>
              <h2 class="section-title" style="color: var(--color-warm-cream); text-align: left;">Merayakan Cinta dalam Kehangatan Tradisi Jawa</h2>
              <p style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 24px;">
                Wujudkan resepsi pernikahan impian Anda di bawah naungan Joglo kayu jati bersejarah dan hamparan kebon hijau rindang. Angkringan Widoro menyediakan paket pernikahan menyeluruh mulai dari intimate wedding 100 pax hingga pesta ageng 500+ tamu dengan hidangan katering istimewa dan suasana malam bertabur fairy lights.
              </p>
              <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-warm-cream); font-family: var(--font-serif);">600+</div>
                  <div style="font-size: 0.85rem; color: var(--color-wood-lighter);">Kapasitas Tamu</div>
                </div>
                <div style="width: 1px; background: rgba(233,223,201,0.2);"></div>
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-warm-cream); font-family: var(--font-serif);">1.500 m²</div>
                  <div style="font-size: 0.85rem; color: var(--color-wood-lighter);">Area Kebon & Joglo</div>
                </div>
                <div style="width: 1px; background: rgba(233,223,201,0.2);"></div>
                <div>
                  <div style="font-size: 2rem; font-weight: 800; color: var(--color-warm-cream); font-family: var(--font-serif);">Lengkap</div>
                  <div style="font-size: 0.85rem; color: var(--color-wood-lighter);">Katering & Fasilitas AC</div>
                </div>
              </div>
              <a href="/wedding-venue" class="btn btn-secondary">Pelajari Paket & Kirim Inquiry &rarr;</a>
            </div>
            <div style="position: relative;">
              <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80" alt="Joglo Wedding Venue" style="border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); border: 2px solid var(--color-natural-wood);">
            </div>
          </div>
        </div>
      </section>

      <!-- GALLERY PREVIEW -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Potret Kenangan</span>
            <h2 class="section-title">Galeri Suasana & Momen</h2>
            <p class="section-subtitle">Intip keindahan arsitektur Joglo, kesegaran taman kebon, dan kehangatan pesta perayaan di Angkringan Widoro.</p>
          </div>

          <div class="gallery-grid">
            ${galleryItems.slice(0, 6).map(g => `
              <div class="gallery-item" onclick="PublicApp.openLightbox('${g.image_url}', '${g.title}', '${g.description || ''}')">
                <img src="${g.image_url}" alt="${g.title}" class="gallery-thumb" loading="lazy">
                <div class="gallery-caption-overlay">
                  <span class="gallery-caption-cat">${g.category}</span>
                  <h5 class="gallery-caption-title font-serif">${g.title}</h5>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: var(--spacing-2xl);">
            <a href="/gallery" class="btn btn-outline">Lihat Semua Koleksi Galeri &rarr;</a>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="section section-cream">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Ulasan Terpercaya</span>
            <h2 class="section-title">Apa Kata Mereka?</h2>
            <p class="section-subtitle">Pengalaman nyata dari para tamu santap dan pasangan pengantin yang merayakan momen bahagia bersama kami.</p>
          </div>

          <div class="testimonials-grid">
            ${testimonials.map(t => `
              <div class="testimonial-card">
                <div class="testimonial-stars">
                  ${'★'.repeat(t.rating || 5)}
                </div>
                <p class="testimonial-quote">"${t.quote}"</p>
                <div class="testimonial-author-wrap">
                  <div class="testimonial-author">${t.customer_name}</div>
                  <div class="testimonial-role">${t.customer_role_or_event || 'Pelanggan'} • ${t.event_date || ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CONTACT & LOCATION PREVIEW -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Akses & Lokasi</span>
            <h2 class="section-title">Kunjungi Angkringan Widoro</h2>
            <p class="section-subtitle">Suasana tenang di Cantelan, Ketandan, Klaten Utara — mudah dijangkau dari pusat Klaten maupun jalan raya Jogja-Solo.</p>
          </div>

          <div class="contact-grid">
            <div class="contact-info-card">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">Alamat Restoran & Venue</h4>
                  <p class="contact-item-text">Cantelan, Desa Ketandan, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah (Tepat di Belakang Pabrik Vanili)</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">Jam Operasional</h4>
                  <p class="contact-item-text"><strong>Senin – Jumat:</strong> 10.00 – 22.00 WIB<br><strong>Sabtu – Minggu:</strong> 09.00 – 23.00 WIB</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">WhatsApp Reservasi & Pertanyaan</h4>
                  <p class="contact-item-text">
                    <a href="https://wa.me/6281234567890?text=Halo%20Angkringan%20Widoro,%20saya%20ingin%20bertanya%20informasi%20menu%20dan%20venue" target="_blank" class="btn btn-whatsapp" style="margin-top: 8px; display: inline-flex; padding: 8px 18px; font-size: 0.88rem;">
                      Chat via WhatsApp (+62 812-3456-7890)
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div class="map-embed-wrap">
              <iframe 
                src="https://maps.google.com/maps?q=Cantelan%20Ketandan%20Klaten%20Utara&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                allowfullscreen="" 
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  // ========================================================
  // 2. PAGE: ABOUT US
  // ========================================================
  async renderAbout(container) {
    document.title = 'Tentang Kami — Angkringan Widoro ("Nguliner Neng Kebon")';

    const content = await API.get('/content').catch(() => ({}));
    const about = content.about || {};
    const aboutMeta = about.metadata || {};

    container.innerHTML = `
      <section class="section" style="padding-top: var(--spacing-3xl);">
        <div class="container container-narrow">
          <div class="section-header">
            <span class="badge-heritage">Kisah & Filosofi</span>
            <h1 class="section-title">${about.title || 'Kisah Angkringan Widoro'}</h1>
            <p class="section-subtitle">${about.subtitle || 'Nguliner Neng Kebon: Harmoni Cita Rasa Tradisi, Nuansa Joglo, dan Kesejukan Alam Klaten'}</p>
          </div>

          <div style="margin-bottom: var(--spacing-2xl); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-heritage);">
            <img src="https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80" alt="Bangunan Joglo Angkringan Widoro" style="width: 100%; height: 380px; object-fit: cover;">
          </div>

          <div style="font-size: 1.05rem; line-height: 1.8; color: var(--color-charcoal); margin-bottom: var(--spacing-3xl);">
            ${(about.content || '').split('\n\n').map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join('')}
          </div>

          <!-- Nilai-Nilai & Konsep -->
          <div style="background-color: #fff; border-radius: var(--radius-lg); padding: var(--spacing-2xl); border: 1px solid var(--color-border-subtle); box-shadow: var(--shadow-sm); margin-bottom: var(--spacing-3xl);">
            <h3 class="font-serif" style="font-size: 1.5rem; margin-bottom: 16px; color: var(--color-dark-walnut);">Konsep "Nguliner Neng Kebon"</h3>
            <p style="color: var(--color-charcoal-muted); margin-bottom: 20px;">
              Konsep ini lahir dari kerinduan akan suasana makan yang hangat, santai, dan tidak terburu-buru. Berbeda dari angkringan konvensional yang kerap berhimpitan di tepi jalan, Angkringan Widoro menghadirkan:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
              <div style="padding: 16px; background-color: var(--color-cream-light); border-radius: var(--radius-md);">
                <strong style="color: var(--color-dark-walnut); display: block; margin-bottom: 6px;">Arsitektur Joglo Jati</strong>
                <span style="font-size: 0.9rem; color: var(--color-charcoal-muted);">Bangunan kayu jati asli dengan sistem ventilasi terbuka khas Jawa yang teduh dan menenangkan.</span>
              </div>
              <div style="padding: 16px; background-color: var(--color-cream-light); border-radius: var(--radius-md);">
                <strong style="color: var(--color-dark-walnut); display: block; margin-bottom: 6px;">Kebon Asri Rindang</strong>
                <span style="font-size: 0.9rem; color: var(--color-charcoal-muted);">Area pepohonan hijau luas yang menyegarkan pikiran, cocok untuk berkumpul bersama keluarga besar.</span>
              </div>
              <div style="padding: 16px; background-color: var(--color-cream-light); border-radius: var(--radius-md);">
                <strong style="color: var(--color-dark-walnut); display: block; margin-bottom: 6px;">Kuliner Beragam</strong>
                <span style="font-size: 0.9rem; color: var(--color-charcoal-muted);">Kombinasi sajian khas angkringan, menu Soto Kerbau legendaris, masakan Nusantara hingga cita rasa modern.</span>
              </div>
            </div>
          </div>

          <!-- Visi & Misi -->
          <div style="background-color: var(--color-dark-walnut); color: var(--color-ivory); border-radius: var(--radius-lg); padding: var(--spacing-2xl); margin-bottom: var(--spacing-3xl);">
            <h3 class="font-serif" style="color: var(--color-warm-cream); font-size: 1.4rem; margin-bottom: 12px;">Visi & Komitmen Kami</h3>
            <p style="color: rgba(247,243,234,0.9); margin-bottom: 16px; font-style: italic;">
              "${aboutMeta.vision || 'Menjadi destinasi kuliner dan ruang perayaan warisan budaya Jawa nomor satu di Klaten yang memadukan keasrian alam dan keramahtamahan sejati.'}"
            </p>
            <ul style="padding-left: 20px; color: rgba(247,243,234,0.85); font-size: 0.95rem; line-height: 1.6;">
              ${(aboutMeta.mission || []).map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="/restaurant" class="btn btn-secondary" style="margin-right: 12px;">Lihat Menu Kami</a>
            <a href="/contact" class="btn btn-outline">Kunjungi Lokasi</a>
          </div>
        </div>
      </section>
    `;
  },

  // ========================================================
  // 3. PAGE: RESTAURANT & MENU CATALOG
  // ========================================================
  async renderRestaurant(container) {
    document.title = 'Katalog Menu & Restoran — Angkringan Widoro';

    const [categoriesRes, menuRes] = await Promise.all([
      API.get('/categories').catch(() => ({ data: [] })),
      API.get('/menu').catch(() => ({ data: [] }))
    ]);

    const categories = categoriesRes.data || [];
    const allItems = menuRes.data || [];

    container.innerHTML = `
      <section class="section" style="padding-top: var(--spacing-3xl);">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Kuliner Nusantara</span>
            <h1 class="section-title">Katalog Menu Angkringan Widoro</h1>
            <p class="section-subtitle">Dari Soto Kerbau legendaris hingga aneka nasi kucing, sate rempah, dan wedangan tradisional khas Jawa.</p>
          </div>

          <!-- Search & Filter Controls -->
          <div style="max-width: 500px; margin: 0 auto var(--spacing-xl) auto;">
            <input type="text" id="menu-search-input" class="form-control" placeholder="Cari nama menu (misal: soto, wedang, nasi)..." style="background-color: #fff; box-shadow: var(--shadow-sm);">
          </div>

          <div class="menu-filter-bar" id="menu-category-filters">
            <button class="menu-filter-btn active" data-cat="all">Semua Menu</button>
            ${categories.map(c => `
              <button class="menu-filter-btn" data-cat="${c.id}">${c.name}</button>
            `).join('')}
          </div>

          <!-- Menu Catalog Grid -->
          <div class="menu-grid" id="menu-catalog-grid">
            ${this.renderMenuItemsHtml(allItems)}
          </div>
        </div>
      </section>
    `;

    // Category filter handler
    const filterBtns = container.querySelectorAll('.menu-filter-btn');
    const searchInput = container.querySelector('#menu-search-input');
    const grid = container.querySelector('#menu-catalog-grid');

    let activeCat = 'all';
    let searchQuery = '';

    const applyFilter = () => {
      let filtered = allItems;
      if (activeCat !== 'all') {
        filtered = filtered.filter(item => String(item.category_id) === String(activeCat));
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(q) || 
          (item.description && item.description.toLowerCase().includes(q))
        );
      }
      grid.innerHTML = this.renderMenuItemsHtml(filtered);
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.getAttribute('data-cat');
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilter();
      });
    }
  },

  renderMenuItemsHtml(items) {
    if (items.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-md);">
          <p style="font-size: 1.1rem; color: var(--color-charcoal-muted); margin-bottom: 8px;">Tidak ada menu yang sesuai dengan pencarian Anda.</p>
          <span style="font-size: 0.9rem; color: var(--color-natural-wood);">Silakan pilih kategori lain atau reset kata kunci.</span>
        </div>
      `;
    }

    return items.map(item => `
      <div class="menu-card">
        <div class="menu-img-wrap">
          <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}" alt="${item.name}" class="menu-img" loading="lazy">
          ${item.is_signature ? '<span class="badge-signature">Menu Ikonik</span>' : ''}
        </div>
        <div class="menu-body">
          <span class="menu-category-tag">${item.category_name || 'Kuliner Widoro'}</span>
          <h4 class="menu-item-name font-serif">${item.name}</h4>
          <p class="menu-desc">${item.description}</p>
          <div class="menu-footer">
            <span class="menu-price">${item.price_confirmed ? formatRupiah(item.price) : '<span class="menu-price-unconfirmed">Harga Dikonfirmasi</span>'}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  // ========================================================
  // 4. PAGE: WEDDING VENUE & SPECIAL EVENTS
  // ========================================================
  async renderWeddingVenue(container) {
    document.title = 'Wedding & Event Venue — Angkringan Widoro';

    const [venueRes, packagesRes, facilitiesRes, galleryRes] = await Promise.all([
      API.get('/venue').catch(() => ({ data: {} })),
      API.get('/packages').catch(() => ({ data: [] })),
      API.get('/facilities').catch(() => ({ data: [] })),
      API.get('/gallery?category=wedding').catch(() => ({ data: [] }))
    ]);

    const venue = venueRes.data || {};
    const packages = packagesRes.data || [];
    const facilities = facilitiesRes.data || [];
    const weddingPhotos = galleryRes.data || [];

    container.innerHTML = `
      <!-- VENUE HERO -->
      <section class="section" style="padding-top: var(--spacing-3xl);">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Destinasi Momen Bahagia</span>
            <h1 class="section-title">A Beautiful Place to Celebrate Your Special Day</h1>
            <p class="section-subtitle">Wujudkan pernikahan impian berlatar keanggunan Joglo Jawa klasik dan hamparan taman kebon asri di Klaten.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; align-items: center; margin-bottom: var(--spacing-4xl);">
            <div>
              <h2 class="font-serif" style="font-size: 1.8rem; margin-bottom: 16px; color: var(--color-dark-walnut);">${venue.name || 'Widoro Heritage Joglo & Garden Venue'}</h2>
              <p style="font-size: 1.05rem; line-height: 1.7; color: var(--color-charcoal); margin-bottom: 20px;">
                ${venue.description || 'Angkringan Widoro menyediakan ruang perayaan pesta pernikahan dan acara istimewa yang memadukan keindahan arsitektur Joglo kayu jati klasik dengan lanskap kebon terbuka yang asri dan hijau.'}
              </p>
              
              <div style="background-color: #fff; border-radius: var(--radius-md); padding: 18px; border: 1px solid var(--color-border-subtle); margin-bottom: 24px;">
                <h4 class="font-serif" style="color: var(--color-dark-walnut); margin-bottom: 8px;">Kapasitas & Area Venue:</h4>
                <p style="margin-bottom: 6px; font-size: 0.92rem;"><strong>Semi-Indoor Joglo Utama:</strong> ${venue.indoor_area_desc || 'Joglo kayu jati bertiang sokoguru megah dengan ventilasi terbuka yang teduh.'}</p>
                <p style="margin-bottom: 6px; font-size: 0.92rem;"><strong>Outdoor Garden Area:</strong> ${venue.outdoor_area_desc || 'Halaman kebon rumput alami 1.500 m2 dinaungi pepohonan rindang dan fairy lights.'}</p>
                <p style="margin-bottom: 0; font-size: 0.92rem; color: var(--color-natural-wood);"><strong>Daya Tampung:</strong> Hingga ${venue.capacity_standing || 600} tamu standing party / ${venue.capacity_seated || 350} tamu seated buffet.</p>
              </div>

              <a href="#wedding-inquiry-section" class="btn btn-secondary">Kirim Formulir Wedding Inquiry &darr;</a>
            </div>

            <div>
              <div style="border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl);">
                <img src="${venue.hero_image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80'}" alt="Widoro Wedding Venue" style="width: 100%; height: 420px; object-fit: cover;">
              </div>
            </div>
          </div>

          <!-- WEDDING VENUE GALLERY -->
          <div style="margin-bottom: var(--spacing-4xl);">
            <div class="section-header" style="margin-bottom: var(--spacing-2xl);">
              <span class="badge-heritage">Dokumentasi Acara</span>
              <h3 class="section-title" style="font-size: 2rem;">Galeri Dekorasi & Suasana Wedding</h3>
            </div>
            <div class="gallery-grid">
              ${weddingPhotos.map(g => `
                <div class="gallery-item" onclick="PublicApp.openLightbox('${g.image_url}', '${g.title}', '${g.description || ''}')">
                  <img src="${g.image_url}" alt="${g.title}" class="gallery-thumb" loading="lazy">
                  <div class="gallery-caption-overlay">
                    <span class="gallery-caption-cat">Pernikahan & Acara</span>
                    <h5 class="gallery-caption-title font-serif">${g.title}</h5>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- FACILITIES -->
          <div style="margin-bottom: var(--spacing-4xl);">
            <div class="section-header" style="margin-bottom: var(--spacing-2xl);">
              <span class="badge-heritage">Kenyamanan Maksimal</span>
              <h3 class="section-title" style="font-size: 2rem;">Fasilitas Lengkap Venue</h3>
            </div>
            <div class="facilities-grid">
              ${facilities.map(f => `
                <div class="facility-card">
                  <div class="facility-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h4 class="facility-name font-serif">${f.name}</h4>
                    <p class="facility-desc">${f.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- WEDDING PACKAGES -->
          <div style="margin-bottom: var(--spacing-4xl);">
            <div class="section-header" style="margin-bottom: var(--spacing-2xl);">
              <span class="badge-heritage">Pilihan Eksklusif</span>
              <h3 class="section-title" style="font-size: 2rem;">Paket Pernikahan & Acara Spesial</h3>
              <p class="section-subtitle">Didesain cermat untuk memberikan kepuasan, kemewahan budaya, dan kemudahan bagi kedua mempelai.</p>
            </div>

            <div class="packages-grid">
              ${packages.map(p => {
                let inclusions = [];
                try {
                  inclusions = JSON.parse(p.inclusions_json || '[]');
                } catch(e) {
                  inclusions = [];
                }

                return `
                  <div class="package-card ${p.is_featured ? 'featured' : ''}">
                    ${p.is_featured ? '<div class="package-featured-badge">Paling Diminati</div>' : ''}
                    <h3 class="package-name font-serif">${p.name}</h3>
                    <div class="package-pax-badge">${p.pax} Undangan (Pax)</div>
                    
                    <div class="package-price-wrap">
                      <div class="package-price-num">${formatRupiah(p.price)}</div>
                      <span style="font-size: 0.8rem; color: var(--color-charcoal-muted);">Harga Bersahabat • Sudah Termasuk Venue</span>
                    </div>

                    <p style="font-size: 0.88rem; color: var(--color-charcoal-muted); margin-bottom: 16px;">${p.description}</p>

                    <ul class="package-inclusions">
                      ${inclusions.map(inc => `
                        <li>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>${inc}</span>
                        </li>
                      `).join('')}
                    </ul>

                    <a href="#wedding-inquiry-section" class="btn ${p.is_featured ? 'btn-primary' : 'btn-outline'}" onclick="PublicApp.prefillPackage('${p.name}')">
                      Pilih Paket Ini
                    </a>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- WEDDING INQUIRY FORM -->
          <div id="wedding-inquiry-section" class="inquiry-box">
            <div class="section-header" style="margin-bottom: var(--spacing-xl);">
              <span class="badge-heritage">Konsultasi Tanggal & Acara</span>
              <h3 class="section-title" style="font-size: 1.8rem;">Formulir Pengajuan Wedding Inquiry</h3>
              <p class="section-subtitle" style="font-size: 0.95rem;">
                Kirimkan rencana hari bahagia Anda. Pengelola Angkringan Widoro akan memeriksa ketersediaan tanggal dan menghubungi Anda secara pribadi.
              </p>
            </div>

            <div id="wedding-form-alert" class="form-alert"></div>

            <form id="wedding-inquiry-form">
              <input type="hidden" name="inquiry_type" value="wedding">
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nama Lengkap / Pasangan <span class="req">*</span></label>
                  <input type="text" name="customer_name" class="form-control" placeholder="Contoh: Bramantyo & Sekar" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Nomor WhatsApp Aktif <span class="req">*</span></label>
                  <input type="tel" name="whatsapp" class="form-control" placeholder="Contoh: 081234567890" required>
                  <div class="form-note">Pengelola akan menghubungi Anda via WhatsApp ini.</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Alamat Email (Opsional)</label>
                  <input type="email" name="email" class="form-control" placeholder="nama@email.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Jenis Acara <span class="req">*</span></label>
                  <select name="event_type" id="wedding-event-type" class="form-control" required>
                    <option value="Pernikahan (Wedding)">Pernikahan (Wedding Resepsi/Akad)</option>
                    <option value="Lamaran / Tunangan">Lamaran / Tunangan Keluarga</option>
                    <option value="Intimate Wedding">Intimate Wedding (< 150 Pax)</option>
                    <option value="Gathering & Reuni">Gathering Perusahaan / Reuni</option>
                    <option value="Ulang Tahun / Syukuran">Ulang Tahun / Syukuran</option>
                    <option value="Lainnya">Acara Lainnya</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Perkiraan Tanggal Acara <span class="req">*</span></label>
                  <input type="date" name="event_date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Estimasi Jumlah Undangan (Pax) <span class="req">*</span></label>
                  <input type="number" name="guest_count" class="form-control" placeholder="Contoh: 250" min="20" max="1000" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Pesan Tambahan, Permintaan Khusus, atau Paket yang Diminati</label>
                <textarea name="message" id="wedding-message" class="form-control" placeholder="Tuliskan jika ada preferensi paket (misal: Paket Kebon Widoro), tema dekorasi, atau jadwal survei lokasi..."></textarea>
              </div>

              <div style="background-color: rgba(164, 119, 79, 0.1); border-left: 4px solid var(--color-natural-wood); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: var(--spacing-lg); font-size: 0.85rem; color: var(--color-charcoal);">
                <strong>Catatan Penting:</strong> Formulir ini merupakan pengajuan permohonan konsultasi tanggal & venue (bukan reservasi otomatis). Pengelola Angkringan Widoro akan segera memverifikasi jadwal dan menghubungi Anda.
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; font-size: 1.05rem; padding: 14px;">
                Kirim Pengajuan Wedding Inquiry
              </button>
            </form>

            <div style="text-align: center; margin-top: var(--spacing-lg); font-size: 0.9rem; color: var(--color-charcoal-muted);">
              Atau ingin konsultasi langsung via WhatsApp? 
              <a href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Angkringan%20Widoro,%20saya%20ingin%20konsultasi%20mengenai%20Wedding%20Venue%20dan%20Paket%20Acara" target="_blank" style="color: #25D366; font-weight: 700; text-decoration: underline;">
                Klik di Sini untuk Chat WA
              </a>
            </div>
          </div>
        </div>
      </section>
    `;

    // Handle wedding inquiry form submission
    const form = container.querySelector('#wedding-inquiry-form');
    const alertBox = container.querySelector('#wedding-form-alert');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Mengirim pengajuan...';

        try {
          const res = await API.post('/inquiries', payload);
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = `
            <strong>Berhasil Mengirim Pengajuan!</strong><br>
            Terima kasih Bapak/Ibu <strong>${payload.customer_name}</strong>. Pengajuan wedding inquiry Anda telah tersimpan di sistem pengelola Angkringan Widoro. Tim kami akan segera menghubungi WhatsApp <strong>${payload.whatsapp}</strong> untuk konfirmasi ketersediaan tanggal dan jadwal survei.
          `;
          form.reset();
        } catch(err) {
          alertBox.className = 'form-alert error';
          alertBox.innerText = `Gagal mengirim pengajuan: ${err.message}`;
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Kirim Pengajuan Wedding Inquiry';
        }
      });
    }
  },

  prefillPackage(packageName) {
    const textarea = document.getElementById('wedding-message');
    if (textarea) {
      textarea.value = `Saya berminat dengan ${packageName}. Mohon informasi ketersediaan tanggal dan detail paket kateringnya.`;
    }
  },

  // ========================================================
  // 5. PAGE: GALLERY
  // ========================================================
  async renderGallery(container) {
    document.title = 'Galeri Foto — Angkringan Widoro';

    const galleryRes = await API.get('/gallery').catch(() => ({ data: [] }));
    const allGallery = galleryRes.data || [];

    container.innerHTML = `
      <section class="section" style="padding-top: var(--spacing-3xl);">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Dokumentasi Visual</span>
            <h1 class="section-title">Galeri Angkringan Widoro</h1>
            <p class="section-subtitle">Potret arsitektur Joglo, kehangatan hidangan kuliner, keasrian kebon, dan dekorasi acara pernikahan.</p>
          </div>

          <!-- Category Filter Bar -->
          <div class="menu-filter-bar" id="gallery-category-filters">
            <button class="menu-filter-btn active" data-cat="all">Semua Foto</button>
            <button class="menu-filter-btn" data-cat="interior">Interior Joglo</button>
            <button class="menu-filter-btn" data-cat="food">Makanan & Minuman</button>
            <button class="menu-filter-btn" data-cat="atmosphere">Suasana Kebun & Angkringan</button>
            <button class="menu-filter-btn" data-cat="wedding">Pernikahan & Acara</button>
            <button class="menu-filter-btn" data-cat="venue">Detail Venue</button>
          </div>

          <div class="gallery-grid" id="gallery-items-grid">
            ${this.renderGalleryItemsHtml(allGallery)}
          </div>
        </div>
      </section>
    `;

    const filterBtns = container.querySelectorAll('.menu-filter-btn');
    const grid = container.querySelector('#gallery-items-grid');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');
        const filtered = cat === 'all' ? allGallery : allGallery.filter(g => g.category === cat);
        grid.innerHTML = this.renderGalleryItemsHtml(filtered);
      });
    });
  },

  renderGalleryItemsHtml(items) {
    if (items.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-md);">
          <p style="color: var(--color-charcoal-muted);">Belum ada foto dalam kategori ini.</p>
        </div>
      `;
    }

    return items.map(g => `
      <div class="gallery-item" onclick="PublicApp.openLightbox('${g.image_url}', '${g.title}', '${g.description || ''}')">
        <img src="${g.image_url}" alt="${g.title}" class="gallery-thumb" loading="lazy">
        <div class="gallery-caption-overlay">
          <span class="gallery-caption-cat">${g.category}</span>
          <h5 class="gallery-caption-title font-serif">${g.title}</h5>
        </div>
      </div>
    `).join('');
  },

  // ========================================================
  // 6. PAGE: CONTACT & GENERAL INQUIRY
  // ========================================================
  async renderContact(container) {
    document.title = 'Kontak & Lokasi — Angkringan Widoro';

    container.innerHTML = `
      <section class="section" style="padding-top: var(--spacing-3xl);">
        <div class="container">
          <div class="section-header">
            <span class="badge-heritage">Pintu Terbuka</span>
            <h1 class="section-title">Hubungi Angkringan Widoro</h1>
            <p class="section-subtitle">Ada pertanyaan, saran, atau ingin reservasi meja? Kami siap membantu Anda dengan senang hati.</p>
          </div>

          <div class="contact-grid" style="margin-bottom: var(--spacing-4xl);">
            <div class="contact-info-card">
              <h3 class="font-serif" style="font-size: 1.5rem; color: var(--color-dark-walnut); margin-bottom: 24px;">Informasi Lengkap</h3>

              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">Alamat Lengkap</h4>
                  <p class="contact-item-text">
                    Cantelan, Desa Ketandan, Kec. Klaten Utara, Kab. Klaten, Jawa Tengah (Belakang Pabrik Vanili) — Kode Pos 57423
                  </p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">Waktu Operasional</h4>
                  <p class="contact-item-text">
                    <strong>Senin – Jumat:</strong> 10.00 – 22.00 WIB<br>
                    <strong>Sabtu – Minggu:</strong> 09.00 – 23.00 WIB
                  </p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">Media Sosial</h4>
                  <p class="contact-item-text">
                    Instagram: <a href="https://instagram.com/angkringanwidoro" target="_blank" style="font-weight: 700;">@angkringanwidoro</a>
                  </p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon" style="background-color: #E8F5E9; color: #2E7D32;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4 class="contact-item-title font-serif">WhatsApp Langsung</h4>
                  <p class="contact-item-text">
                    <a href="https://wa.me/6281234567890?text=Halo%20Angkringan%20Widoro,%20saya%20ingin%20bertanya" target="_blank" class="btn btn-whatsapp" style="margin-top: 6px; padding: 10px 20px;">
                      Kirim Pesan WhatsApp (+62 812-3456-7890)
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- General Inquiry Form -->
            <div class="contact-info-card">
              <h3 class="font-serif" style="font-size: 1.5rem; color: var(--color-dark-walnut); margin-bottom: 20px;">Formulir Pertanyaan & Pesan</h3>
              
              <div id="general-form-alert" class="form-alert"></div>

              <form id="general-inquiry-form">
                <input type="hidden" name="inquiry_type" value="general">
                
                <div class="form-group">
                  <label class="form-label">Nama Anda <span class="req">*</span></label>
                  <input type="text" name="customer_name" class="form-control" placeholder="Nama lengkap Anda" required>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">WhatsApp <span class="req">*</span></label>
                    <input type="tel" name="whatsapp" class="form-control" placeholder="08xxxxxxxxxx" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email (Opsional)</label>
                    <input type="email" name="email" class="form-control" placeholder="nama@email.com">
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Kategori Pertanyaan <span class="req">*</span></label>
                  <select name="event_type" class="form-control" required>
                    <option value="Informasi Umum">Informasi Umum Restoran</option>
                    <option value="Reservasi Meja Restoran">Reservasi Meja / Rombongan Santap</option>
                    <option value="Wedding Venue">Wedding & Event Venue</option>
                    <option value="Saran & Kritik">Saran & Kritik</option>
                    <option value="Kerjasama & Lainnya">Kerjasama & Lainnya</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Pesan Anda <span class="req">*</span></label>
                  <textarea name="message" class="form-control" placeholder="Tuliskan pertanyaan atau kebutuhan Anda secara jelas..." required></textarea>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">
                  Kirim Pesan Sekarang
                </button>
              </form>
            </div>
          </div>

          <!-- Maps Embed -->
          <div>
            <h3 class="font-serif" style="font-size: 1.6rem; color: var(--color-dark-walnut); margin-bottom: 16px; text-align: center;">Peta Lokasi Angkringan Widoro</h3>
            <div class="map-embed-wrap">
              <iframe 
                src="https://maps.google.com/maps?q=Cantelan%20Ketandan%20Klaten%20Utara&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                allowfullscreen="" 
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>
      </section>
    `;

    // Handle general form
    const form = container.querySelector('#general-inquiry-form');
    const alertBox = container.querySelector('#general-form-alert');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Mengirim pesan...';

        try {
          await API.post('/inquiries', payload);
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = `
            <strong>Pesan Berhasil Terkirim!</strong><br>
            Terima kasih <strong>${payload.customer_name}</strong>. Pesan Anda telah tersimpan dan akan segera ditanggapi oleh tim pengelola Angkringan Widoro via WhatsApp <strong>${payload.whatsapp}</strong>.
          `;
          form.reset();
        } catch(err) {
          alertBox.className = 'form-alert error';
          alertBox.innerText = `Gagal mengirim pesan: ${err.message}`;
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Kirim Pesan Sekarang';
        }
      });
    }
  },

  // ========================================================
  // LIGHTBOX MODAL HANDLER
  // ========================================================
  setupLightbox() {
    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightbox-modal';
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" onclick="PublicApp.closeLightbox()">&times;</button>
          <img id="lightbox-img" class="lightbox-img" src="" alt="Pratinjau Foto">
          <div id="lightbox-caption" class="lightbox-caption"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeLightbox();
        }
      });
    }
  },

  openLightbox(src, title, desc) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    if (modal && img && caption) {
      img.src = src;
      caption.innerHTML = `<strong>${title}</strong>${desc ? `<br><span style="font-size: 0.88rem; color: #ccc;">${desc}</span>` : ''}`;
      modal.classList.add('active');
    }
  },

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  PublicApp.init();
});
