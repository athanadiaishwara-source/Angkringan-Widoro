// ========================================================
// PRIVATE OWNER/ADMIN JAVASCRIPT: ANGKRINGAN WIDORO
// Secure Authentication, Admin SPA Router & Full CRUD Engine
// ========================================================

const AdminApp = {
  currentUser: null,
  currentPath: window.location.pathname,
  stats: {},

  async init() {
    this.setupNavigation();
    await this.checkAuth();
    this.renderAdminPage(this.currentPath);

    window.addEventListener('popstate', () => {
      this.currentPath = window.location.pathname;
      this.renderAdminPage(this.currentPath);
    });
  },

  setupNavigation() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('/admin') && !link.hasAttribute('target')) {
        e.preventDefault();
        this.navigateTo(href);
      }
    });
  },

  navigateTo(path) {
    if (path === this.currentPath) return;
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.renderAdminPage(path);
  },

  async checkAuth() {
    const token = API.getToken();
    if (!token) {
      if (this.currentPath !== '/admin/login') {
        this.navigateTo('/admin/login');
      }
      return;
    }

    try {
      const res = await API.get('/auth/me');
      this.currentUser = res.user;
      if (this.currentPath === '/admin/login') {
        this.navigateTo('/admin/dashboard');
      }
    } catch (err) {
      API.clearToken();
      if (this.currentPath !== '/admin/login') {
        this.navigateTo('/admin/login');
      }
    }
  },

  async logout() {
    try {
      await API.post('/auth/logout', {});
    } catch (e) {}
    API.clearToken();
    this.currentUser = null;
    API.showToast('Anda berhasil keluar dari sistem pengelola.', 'info');
    this.navigateTo('/admin/login');
  },

  renderAdminPage(path) {
    const appEl = document.getElementById('admin-app');
    if (!appEl) return;

    if (path === '/admin/login') {
      this.renderLogin(appEl);
      return;
    }

    if (!this.currentUser) {
      this.renderLogin(appEl);
      return;
    }

    // Render Master Layout with Sidebar
    appEl.innerHTML = `
      <div class="admin-layout">
        <!-- SIDEBAR -->
        <aside class="admin-sidebar" id="admin-sidebar">
          <div class="sidebar-header">
            <img src="/images/logo.svg" alt="Logo Widoro" class="sidebar-logo">
            <div>
              <div class="sidebar-brand-name">Angkringan Widoro</div>
              <div class="sidebar-brand-sub">PANEL PENGELOLA CMS</div>
            </div>
          </div>

          <ul class="sidebar-nav">
            <li class="sidebar-nav-item">
              <a href="/admin/dashboard" class="sidebar-link ${path === '/admin/dashboard' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/inquiries" class="sidebar-link ${path === '/admin/inquiries' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Data Inquiries</span>
                <span class="sidebar-badge" id="nav-badge-inquiries" style="display: none;">0</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/menu" class="sidebar-link ${path === '/admin/menu' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                <span>Kelola Menu</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/gallery" class="sidebar-link ${path === '/admin/gallery' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Galeri Foto</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/wedding-venue" class="sidebar-link ${path === '/admin/wedding-venue' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Wedding & Venue</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/testimonials" class="sidebar-link ${path === '/admin/testimonials' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Testimoni</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/website-content" class="sidebar-link ${path === '/admin/website-content' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Konten Website CMS</span>
              </a>
            </li>
            <li class="sidebar-nav-item">
              <a href="/admin/settings" class="sidebar-link ${path === '/admin/settings' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                <span>Pengaturan Akun</span>
              </a>
            </li>
          </ul>

          <div class="sidebar-footer">
            <a href="/" target="_blank" class="btn btn-outline-white" style="font-size: 0.85rem; padding: 8px 14px; width: 100%;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Buka Website Publik
            </a>
            <button onclick="AdminApp.logout()" class="btn btn-primary" style="font-size: 0.85rem; padding: 8px 14px; width: 100%; background-color: #3E291E;">
              Keluar (Logout)
            </button>
          </div>
        </aside>

        <!-- MAIN VIEW -->
        <main class="admin-main">
          <!-- Top Bar -->
          <header class="admin-topbar">
            <h1 class="topbar-title font-serif" id="admin-page-title">Panel Pengelola</h1>
            <div class="topbar-actions">
              <div class="admin-user-pill">
                <div class="admin-avatar">${(this.currentUser.name || 'W').charAt(0)}</div>
                <span>${this.currentUser.name || 'Pemilik Widoro'}</span>
              </div>
            </div>
          </header>

          <!-- Dynamic Container -->
          <div class="admin-content-container" id="admin-view-content"></div>
        </main>
      </div>

      <!-- Shared Admin Modal -->
      <div id="admin-modal" class="admin-modal">
        <div class="modal-dialog" id="admin-modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title font-serif" id="modal-title">Form Modal</h3>
            <button class="modal-close-btn" onclick="AdminApp.closeModal()">&times;</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
        </div>
      </div>
    `;

    // Render Subview
    const viewContainer = document.getElementById('admin-view-content');
    if (path === '/admin/dashboard' || path === '/admin') {
      this.renderDashboardView(viewContainer);
    } else if (path === '/admin/menu') {
      this.renderMenuView(viewContainer);
    } else if (path === '/admin/gallery') {
      this.renderGalleryView(viewContainer);
    } else if (path === '/admin/wedding-venue') {
      this.renderWeddingVenueView(viewContainer);
    } else if (path === '/admin/inquiries') {
      this.renderInquiriesView(viewContainer);
    } else if (path === '/admin/testimonials') {
      this.renderTestimonialsView(viewContainer);
    } else if (path === '/admin/website-content') {
      this.renderWebsiteContentView(viewContainer);
    } else if (path === '/admin/settings') {
      this.renderSettingsView(viewContainer);
    } else {
      this.renderDashboardView(viewContainer);
    }
  },

  // ========================================================
  // LOGIN VIEW
  // ========================================================
  renderLogin(container) {
    document.title = 'Login Pengelola — Angkringan Widoro';
    container.innerHTML = `
      <div class="admin-login-wrapper">
        <div class="login-card">
          <div class="login-header">
            <img src="/images/logo.svg" alt="Angkringan Widoro" class="login-logo">
            <h2 class="login-title">Masuk ke Panel Pengelola</h2>
            <p class="login-subtitle">Kelola menu, reservasi, galeri, dan konten website</p>
          </div>

          <div id="login-alert" class="form-alert"></div>

          <form id="admin-login-form">
            <div class="form-group">
              <label class="form-label">Email Pengelola</label>
              <input type="email" name="email" class="form-control" value="admin@angkringanwidoro.com" required autofocus>
            </div>

            <div class="form-group">
              <label class="form-label">Kata Sandi (Password)</label>
              <input type="password" name="password" class="form-control" value="adminwidoro123" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; padding: 12px;">
              Masuk ke Dashboard
            </button>
          </form>

          <div style="text-align: center; margin-top: 24px; font-size: 0.82rem; color: var(--color-charcoal-muted);">
            Kredensial Default Percobaan: <br>
            <code>admin@angkringanwidoro.com</code> / <code>adminwidoro123</code>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-login-form');
    const alertBox = document.getElementById('login-alert');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const email = formData.get('email');
      const password = formData.get('password');

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Memverifikasi...';

      try {
        const res = await API.post('/auth/login', { email, password });
        API.setToken(res.token);
        this.currentUser = res.user;
        API.showToast('Login berhasil! Sugeng rawuh.', 'success');
        this.navigateTo('/admin/dashboard');
      } catch (err) {
        alertBox.className = 'form-alert error';
        alertBox.innerText = err.message || 'Email atau kata sandi tidak valid.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Masuk ke Dashboard';
      }
    });
  },

  // ========================================================
  // SUBVIEW: DASHBOARD
  // ========================================================
  async renderDashboardView(container) {
    document.title = 'Dashboard Pengelola — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Ikhtisar Dashboard';

    const [statsRes, recentInquiriesRes] = await Promise.all([
      API.get('/stats').catch(() => ({ stats: {} })),
      API.get('/inquiries?limit=5').catch(() => ({ data: [] }))
    ]);

    const stats = statsRes.stats || {
      total_menu: 0,
      total_gallery: 0,
      total_inquiries: 0,
      new_wedding_inquiries: 0
    };
    const recentInquiries = recentInquiriesRes.data || [];

    // Update sidebar badge if any new inquiries
    const badge = document.getElementById('nav-badge-inquiries');
    if (badge && stats.new_wedding_inquiries > 0) {
      badge.style.display = 'inline-block';
      badge.innerText = stats.new_wedding_inquiries;
    }

    container.innerHTML = `
      <!-- METRIC CARDS -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-wrap menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>
          </div>
          <div>
            <div class="metric-value">${stats.total_menu}</div>
            <div class="metric-label">Menu Aktif Ditayangkan</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap gallery">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div>
            <div class="metric-value">${stats.total_gallery}</div>
            <div class="metric-label">Foto Galeri Publik</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap inquiries">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path></svg>
          </div>
          <div>
            <div class="metric-value">${stats.total_inquiries}</div>
            <div class="metric-label">Total Semua Inquiry</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap wedding">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          </div>
          <div>
            <div class="metric-value">${stats.new_wedding_inquiries}</div>
            <div class="metric-label">Wedding Inquiry Baru</div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div style="display: flex; gap: 12px; margin-bottom: var(--spacing-2xl); flex-wrap: wrap;">
        <button onclick="AdminApp.openAddMenuModal()" class="btn btn-primary" style="font-size: 0.88rem; padding: 10px 18px;">
          + Tambah Menu Baru
        </button>
        <button onclick="AdminApp.openAddGalleryModal()" class="btn btn-secondary" style="font-size: 0.88rem; padding: 10px 18px;">
          + Unggah Foto Galeri
        </button>
        <a href="/admin/inquiries" class="btn btn-outline" style="font-size: 0.88rem; padding: 10px 18px;">
          Lihat Semua Inquiries Masuk &rarr;
        </a>
      </div>

      <!-- RECENT INQUIRIES TABLE -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Inquiry Terbaru Pengunjung Website</h3>
          <a href="/admin/inquiries" style="font-size: 0.85rem; font-weight: 600; color: var(--color-natural-wood);">Lihat Selengkapnya &rarr;</a>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tanggal Masuk</th>
                <th>Nama Pelanggan</th>
                <th>Tipe & Kategori</th>
                <th>Rencana Acara / Tamu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${recentInquiries.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; color: #9CA3AF; padding: 30px;">Belum ada inquiry yang masuk.</td></tr>
              ` : recentInquiries.map(inq => `
                <tr>
                  <td>${formatTanggal(inq.created_at)}</td>
                  <td>
                    <strong>${inq.customer_name}</strong><br>
                    <span style="font-size: 0.8rem; color: #6B7280;">WA: ${inq.whatsapp}</span>
                  </td>
                  <td>
                    <span class="badge-heritage" style="padding: 2px 8px; font-size: 0.72rem;">${inq.inquiry_type === 'wedding' ? 'Pernikahan' : 'Umum'}</span><br>
                    <span style="font-size: 0.82rem;">${inq.event_type || '-'}</span>
                  </td>
                  <td>
                    ${inq.event_date ? formatTanggal(inq.event_date) : '-'}<br>
                    <span style="font-size: 0.8rem; color: #6B7280;">${inq.guest_count ? inq.guest_count + ' Pax' : ''}</span>
                  </td>
                  <td>
                    <span class="status-pill ${inq.status}">${this.translateStatus(inq.status)}</span>
                  </td>
                  <td>
                    <button onclick="AdminApp.viewInquiryDetail(${inq.id})" class="btn-action-icon" title="Lihat Pesan">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <a href="${this.generateWhatsAppUrl(inq)}" target="_blank" class="btn-action-icon" title="Chat WhatsApp" style="color: #25D366;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ========================================================
  // SUBVIEW: MENU MANAGEMENT
  // ========================================================
  async renderMenuView(container) {
    document.title = 'Manajemen Menu — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Kelola Katalog Menu';

    const [categoriesRes, menuRes] = await Promise.all([
      API.get('/categories').catch(() => ({ data: [] })),
      API.get('/menu').catch(() => ({ data: [] }))
    ]);

    const categories = categoriesRes.data || [];
    const items = menuRes.data || [];

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-table-actions">
            <input type="text" id="admin-menu-search" class="search-input" placeholder="Cari hidangan...">
            <select id="admin-menu-cat-filter" class="filter-select">
              <option value="all">Semua Kategori</option>
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <button onclick="AdminApp.openAddMenuModal()" class="btn btn-primary" style="font-size: 0.88rem; padding: 8px 16px;">
            + Tambah Menu Baru
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table" id="admin-menu-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama Hidangan</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Signature?</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderAdminMenuRows(items)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Filter handlers
    const searchInput = container.querySelector('#admin-menu-search');
    const catSelect = container.querySelector('#admin-menu-cat-filter');
    const tbody = container.querySelector('#admin-menu-table tbody');

    const filterMenu = () => {
      const q = searchInput.value.toLowerCase();
      const cat = catSelect.value;
      const filtered = items.filter(it => {
        const matchCat = cat === 'all' || String(it.category_id) === String(cat);
        const matchQ = it.name.toLowerCase().includes(q) || (it.description && it.description.toLowerCase().includes(q));
        return matchCat && matchQ;
      });
      tbody.innerHTML = this.renderAdminMenuRows(filtered);
    };

    searchInput.addEventListener('input', filterMenu);
    catSelect.addEventListener('change', filterMenu);
  },

  renderAdminMenuRows(items) {
    if (items.length === 0) {
      return `<tr><td colspan="7" style="text-align: center; color: #9CA3AF; padding: 30px;">Tidak ada menu ditemukan.</td></tr>`;
    }

    return items.map(it => `
      <tr>
        <td>
          <img src="${it.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}" class="table-thumb" alt="${it.name}">
        </td>
        <td>
          <strong>${it.name}</strong><br>
          <span style="font-size: 0.78rem; color: #6B7280;">${(it.description || '').substring(0, 50)}...</span>
        </td>
        <td>${it.category_name || '-'}</td>
        <td><strong>${it.price_confirmed ? formatRupiah(it.price) : 'Perlu Konfirmasi'}</strong></td>
        <td>${it.is_signature ? '<span class="status-pill published">Ikonik</span>' : '-'}</td>
        <td>
          <button onclick="AdminApp.toggleMenuPublish(${it.id}, ${it.is_published ? 0 : 1})" class="status-pill ${it.is_published ? 'published' : 'draft'}" style="cursor: pointer; border: none;">
            ${it.is_published ? 'Tayang' : 'Draft'}
          </button>
        </td>
        <td>
          <button onclick="AdminApp.openEditMenuModal(${it.id})" class="btn-action-icon" title="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button onclick="AdminApp.deleteMenuItem(${it.id})" class="btn-action-icon danger" title="Hapus">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  },

  async openAddMenuModal() {
    const categoriesRes = await API.get('/categories').catch(() => ({ data: [] }));
    const categories = categoriesRes.data || [];

    this.openModal('Tambah Menu Baru', `
      <form id="add-menu-form">
        <div class="form-group">
          <label class="form-label">Nama Menu <span class="req">*</span></label>
          <input type="text" name="name" class="form-control" placeholder="Contoh: Soto Kerbau Widoro" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kategori <span class="req">*</span></label>
            <select name="category_id" class="form-control" required>
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga (Rp) <span class="req">*</span></label>
            <input type="number" name="price" class="form-control" placeholder="Contoh: 25000" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL Foto Menu</label>
          <input type="url" name="image_url" class="form-control" placeholder="https://images.unsplash.com/...">
          <div class="form-note">Gunakan link gambar langsung atau biarkan kosong untuk foto standar.</div>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi Menu</label>
          <textarea name="description" class="form-control" placeholder="Jelaskan cita rasa hidangan, bahan rempah, dan keunggulannya..."></textarea>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: var(--spacing-lg);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_signature" value="1">
            <span>Tandai Sebagai Menu Ikonik (Signature)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_published" value="1" checked>
            <span>Langsung Tayangkan ke Publik</span>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Menu</button>
      </form>
    `);

    document.getElementById('add-menu-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        name: formData.get('name'),
        category_id: parseInt(formData.get('category_id')),
        price: parseInt(formData.get('price')) || 0,
        price_confirmed: 1,
        image_url: formData.get('image_url') || '',
        description: formData.get('description') || '',
        is_signature: formData.get('is_signature') ? 1 : 0,
        is_published: formData.get('is_published') ? 1 : 0
      };

      try {
        await API.post('/menu', payload);
        API.showToast('Menu baru berhasil ditambahkan!', 'success');
        this.closeModal();
        this.renderMenuView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async openEditMenuModal(id) {
    const [categoriesRes, menuRes] = await Promise.all([
      API.get('/categories').catch(() => ({ data: [] })),
      API.get(`/menu/${id}`).catch(() => ({ data: null }))
    ]);

    const categories = categoriesRes.data || [];
    const item = menuRes.data;
    if (!item) {
      API.showToast('Data menu tidak ditemukan.', 'error');
      return;
    }

    this.openModal(`Edit Menu: ${item.name}`, `
      <form id="edit-menu-form">
        <div class="form-group">
          <label class="form-label">Nama Menu <span class="req">*</span></label>
          <input type="text" name="name" class="form-control" value="${item.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kategori <span class="req">*</span></label>
            <select name="category_id" class="form-control" required>
              ${categories.map(c => `<option value="${c.id}" ${c.id === item.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Harga (Rp) <span class="req">*</span></label>
            <input type="number" name="price" class="form-control" value="${item.price}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL Foto Menu</label>
          <input type="url" name="image_url" class="form-control" value="${item.image_url || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi Menu</label>
          <textarea name="description" class="form-control">${item.description || ''}</textarea>
        </div>

        <div style="display: flex; gap: 20px; margin-bottom: var(--spacing-lg);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_signature" value="1" ${item.is_signature ? 'checked' : ''}>
            <span>Menu Ikonik (Signature)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_published" value="1" ${item.is_published ? 'checked' : ''}>
            <span>Tayangkan ke Publik</span>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Perbarui Menu</button>
      </form>
    `);

    document.getElementById('edit-menu-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        name: formData.get('name'),
        category_id: parseInt(formData.get('category_id')),
        price: parseInt(formData.get('price')) || 0,
        price_confirmed: 1,
        image_url: formData.get('image_url') || '',
        description: formData.get('description') || '',
        is_signature: formData.get('is_signature') ? 1 : 0,
        is_published: formData.get('is_published') ? 1 : 0
      };

      try {
        await API.put(`/menu/${id}`, payload);
        API.showToast('Menu berhasil diperbarui!', 'success');
        this.closeModal();
        this.renderMenuView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async toggleMenuPublish(id, newStatus) {
    try {
      await API.put(`/menu/${id}`, { is_published: newStatus });
      API.showToast(`Status menu berhasil diubah menjadi ${newStatus ? 'Tayang' : 'Draft'}!`, 'success');
      this.renderMenuView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deleteMenuItem(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini dari database?')) return;
    try {
      await API.delete(`/menu/${id}`);
      API.showToast('Menu berhasil dihapus!', 'info');
      this.renderMenuView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  // ========================================================
  // SUBVIEW: GALLERY MANAGEMENT
  // ========================================================
  async renderGalleryView(container) {
    document.title = 'Manajemen Galeri — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Kelola Galeri Foto';

    const galleryRes = await API.get('/gallery').catch(() => ({ data: [] }));
    const items = galleryRes.data || [];

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Daftar Foto Galeri (${items.length} Foto)</h3>
          <button onclick="AdminApp.openAddGalleryModal()" class="btn btn-secondary" style="font-size: 0.88rem; padding: 8px 16px;">
            + Unggah Foto Baru
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Pratinjau</th>
                <th>Judul Foto</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; color: #9CA3AF; padding: 30px;">Belum ada foto dalam galeri.</td></tr>
              ` : items.map(g => `
                <tr>
                  <td><img src="${g.image_url}" class="table-thumb" alt="${g.title}"></td>
                  <td><strong>${g.title}</strong></td>
                  <td><span class="badge-heritage" style="padding: 2px 8px; font-size: 0.72rem;">${g.category}</span></td>
                  <td><span style="font-size: 0.82rem; color: #6B7280;">${(g.description || '-').substring(0, 45)}...</span></td>
                  <td>
                    <span class="status-pill ${g.is_published ? 'published' : 'draft'}">
                      ${g.is_published ? 'Tayang' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button onclick="AdminApp.deleteGalleryItem(${g.id})" class="btn-action-icon danger" title="Hapus Foto">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openAddGalleryModal() {
    this.openModal('Unggah Foto Galeri Baru', `
      <form id="add-gallery-form">
        <div class="form-group">
          <label class="form-label">Judul Foto <span class="req">*</span></label>
          <input type="text" name="title" class="form-control" placeholder="Contoh: Suasana Malam Fairy Lights di Kebon" required>
        </div>

        <div class="form-group">
          <label class="form-label">Kategori Galeri <span class="req">*</span></label>
          <select name="category" class="form-control" required>
            <option value="interior">Interior Joglo</option>
            <option value="food">Makanan & Minuman</option>
            <option value="atmosphere">Suasana Kebun & Angkringan</option>
            <option value="wedding">Pernikahan & Acara</option>
            <option value="venue">Detail Venue</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">URL Foto <span class="req">*</span></label>
          <input type="url" name="image_url" class="form-control" placeholder="https://images.unsplash.com/..." required>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi Foto</label>
          <textarea name="description" class="form-control" placeholder="Tuliskan keterangan pelengkap foto..."></textarea>
        </div>

        <button type="submit" class="btn btn-secondary" style="width: 100%;">Unggah & Simpan</button>
      </form>
    `);

    document.getElementById('add-gallery-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        title: formData.get('title'),
        category: formData.get('category'),
        image_url: formData.get('image_url'),
        description: formData.get('description'),
        is_published: 1,
        is_featured: 1
      };

      try {
        await API.post('/gallery', payload);
        API.showToast('Foto baru berhasil ditambahkan ke galeri!', 'success');
        this.closeModal();
        this.renderGalleryView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async deleteGalleryItem(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) return;
    try {
      await API.delete(`/gallery/${id}`);
      API.showToast('Foto berhasil dihapus.', 'info');
      this.renderGalleryView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  // ========================================================
  // SUBVIEW: WEDDING VENUE MANAGEMENT
  // ========================================================
  async renderWeddingVenueView(container) {
    document.title = 'Manajemen Wedding Venue — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Kelola Venue & Paket Pernikahan';

    const [venueRes, packagesRes, facilitiesRes] = await Promise.all([
      API.get('/venue').catch(() => ({ data: {} })),
      API.get('/packages').catch(() => ({ data: [] })),
      API.get('/facilities').catch(() => ({ data: [] }))
    ]);

    const venue = venueRes.data || {};
    const packages = packagesRes.data || [];
    const facilities = facilitiesRes.data || [];

    container.innerHTML = `
      <!-- 1. VENUE PROFILE EDITOR -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Profil & Kapasitas Venue Pernikahan</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="edit-venue-info-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Resmi Venue</label>
                <input type="text" name="name" class="form-control" value="${venue.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tagline Venue</label>
                <input type="text" name="tagline" class="form-control" value="${venue.tagline || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kapasitas Seated (Duduk Round-table)</label>
                <input type="number" name="capacity_seated" class="form-control" value="${venue.capacity_seated || 350}">
              </div>
              <div class="form-group">
                <label class="form-label">Kapasitas Standing (Standing Buffet)</label>
                <input type="number" name="capacity_standing" class="form-control" value="${venue.capacity_standing || 600}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Deskripsi Lengkap Venue</label>
              <textarea name="description" class="form-control" rows="4">${venue.description || ''}</textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Deskripsi Area Joglo Utama (Indoor)</label>
                <input type="text" name="indoor_area_desc" class="form-control" value="${venue.indoor_area_desc || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Deskripsi Area Kebon Terbuka (Outdoor)</label>
                <input type="text" name="outdoor_area_desc" class="form-control" value="${venue.outdoor_area_desc || ''}">
              </div>
            </div>

            <button type="submit" class="btn btn-primary">Simpan Perubahan Venue</button>
          </form>
        </div>
      </div>

      <!-- 2. PACKAGES MANAGEMENT -->
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Daftar Paket Pernikahan & Acara</h3>
          <button onclick="AdminApp.openAddPackageModal()" class="btn btn-secondary" style="font-size: 0.88rem; padding: 8px 16px;">
            + Tambah Paket Acara
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nama Paket</th>
                <th>Kapasitas Pax</th>
                <th>Harga Paket</th>
                <th>Unggulan?</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${packages.map(p => `
                <tr>
                  <td>
                    <strong>${p.name}</strong><br>
                    <span style="font-size: 0.8rem; color: #6B7280;">${(p.description || '').substring(0, 50)}...</span>
                  </td>
                  <td><strong>${p.pax} Pax</strong></td>
                  <td><strong style="color: var(--color-dark-walnut);">${formatRupiah(p.price)}</strong></td>
                  <td>${p.is_featured ? '<span class="status-pill published">Paling Diminati</span>' : '-'}</td>
                  <td>
                    <button onclick="AdminApp.openEditPackageModal(${p.id})" class="btn-action-icon" title="Edit Paket">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onclick="AdminApp.deletePackage(${p.id})" class="btn-action-icon danger" title="Hapus Paket">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Handle venue info submit
    const form = container.querySelector('#edit-venue-info-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.capacity_seated = parseInt(payload.capacity_seated) || 350;
      payload.capacity_standing = parseInt(payload.capacity_standing) || 600;

      try {
        await API.put('/venue', payload);
        API.showToast('Informasi venue berhasil diperbarui!', 'success');
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  openAddPackageModal() {
    this.openModal('Tambah Paket Pernikahan / Acara Baru', `
      <form id="add-package-form">
        <div class="form-group">
          <label class="form-label">Nama Paket <span class="req">*</span></label>
          <input type="text" name="name" class="form-control" placeholder="Contoh: Paket Joglo Asri (100 Pax)" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jumlah Undangan (Pax) <span class="req">*</span></label>
            <input type="number" name="pax" class="form-control" placeholder="100" required>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Total (Rp) <span class="req">*</span></label>
            <input type="number" name="price" class="form-control" placeholder="18500000" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ringkasan Paket</label>
          <input type="text" name="description" class="form-control" placeholder="Cocok untuk intimate wedding keluarga...">
        </div>

        <div class="form-group">
          <label class="form-label">Fasilitas / Inklusi (Satu item per baris) <span class="req">*</span></label>
          <textarea name="inclusions" class="form-control" rows="5" placeholder="Joglo Utama 5 Jam&#10;Buffet Prasmanan 100 Pax&#10;Dekorasi Pelaminan Minimalis&#10;Sound System Standard" required></textarea>
        </div>

        <div style="margin-bottom: var(--spacing-lg);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_featured" value="1">
            <span>Tandai Sebagai Paket Paling Diminati (Featured)</span>
          </label>
        </div>

        <button type="submit" class="btn btn-secondary" style="width: 100%;">Simpan Paket</button>
      </form>
    `);

    document.getElementById('add-package-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const inclusionsArray = formData.get('inclusions').split('\n').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: formData.get('name'),
        pax: parseInt(formData.get('pax')),
        price: parseInt(formData.get('price')),
        description: formData.get('description'),
        inclusions_json: JSON.stringify(inclusionsArray),
        is_featured: formData.get('is_featured') ? 1 : 0,
        is_active: 1
      };

      try {
        await API.post('/packages', payload);
        API.showToast('Paket baru berhasil disimpan!', 'success');
        this.closeModal();
        this.renderWeddingVenueView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async openEditPackageModal(id) {
    const res = await API.get(`/packages/${id}`).catch(() => ({ data: null }));
    const p = res.data;
    if (!p) return;

    let inclusionsText = '';
    try {
      const arr = JSON.parse(p.inclusions_json || '[]');
      inclusionsText = arr.join('\n');
    } catch(e) {}

    this.openModal(`Edit Paket: ${p.name}`, `
      <form id="edit-package-form">
        <div class="form-group">
          <label class="form-label">Nama Paket <span class="req">*</span></label>
          <input type="text" name="name" class="form-control" value="${p.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Jumlah Undangan (Pax) <span class="req">*</span></label>
            <input type="number" name="pax" class="form-control" value="${p.pax}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Total (Rp) <span class="req">*</span></label>
            <input type="number" name="price" class="form-control" value="${p.price}" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ringkasan Paket</label>
          <input type="text" name="description" class="form-control" value="${p.description || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Fasilitas / Inklusi (Satu item per baris) <span class="req">*</span></label>
          <textarea name="inclusions" class="form-control" rows="5" required>${inclusionsText}</textarea>
        </div>

        <div style="margin-bottom: var(--spacing-lg);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;">
            <input type="checkbox" name="is_featured" value="1" ${p.is_featured ? 'checked' : ''}>
            <span>Tandai Sebagai Paket Paling Diminati (Featured)</span>
          </label>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Perbarui Paket</button>
      </form>
    `);

    document.getElementById('edit-package-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const inclusionsArray = formData.get('inclusions').split('\n').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: formData.get('name'),
        pax: parseInt(formData.get('pax')),
        price: parseInt(formData.get('price')),
        description: formData.get('description'),
        inclusions_json: JSON.stringify(inclusionsArray),
        is_featured: formData.get('is_featured') ? 1 : 0,
        is_active: 1
      };

      try {
        await API.put(`/packages/${id}`, payload);
        API.showToast('Paket berhasil diperbarui!', 'success');
        this.closeModal();
        this.renderWeddingVenueView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async deletePackage(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
    try {
      await API.delete(`/packages/${id}`);
      API.showToast('Paket berhasil dihapus.', 'info');
      this.renderWeddingVenueView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  // ========================================================
  // SUBVIEW: INQUIRIES MANAGEMENT
  // ========================================================
  async renderInquiriesView(container) {
    document.title = 'Data Inquiries — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Manajemen Pengajuan Inquiry & Pesan';

    const res = await API.get('/inquiries').catch(() => ({ data: [] }));
    const allInquiries = res.data || [];

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-table-actions">
            <select id="inquiry-type-filter" class="filter-select">
              <option value="all">Semua Tipe Inquiry</option>
              <option value="wedding">Pernikahan (Wedding)</option>
              <option value="general">Pertanyaan Umum</option>
            </select>
            <select id="inquiry-status-filter" class="filter-select">
              <option value="all">Semua Status</option>
              <option value="new">Baru (New)</option>
              <option value="in_review">Sedang Ditinjau</option>
              <option value="responded">Ditanggapi</option>
              <option value="closed">Selesai</option>
            </select>
          </div>
          <span style="font-size: 0.85rem; color: #6B7280;">Total: ${allInquiries.length} Pengajuan</span>
        </div>

        <div class="table-responsive">
          <table class="admin-table" id="inquiries-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal Masuk</th>
                <th>Pelanggan</th>
                <th>Tipe & Kategori</th>
                <th>Rencana Acara / Tamu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${this.renderInquiryRows(allInquiries)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const typeFilter = container.querySelector('#inquiry-type-filter');
    const statusFilter = container.querySelector('#inquiry-status-filter');
    const tbody = container.querySelector('#inquiries-table tbody');

    const applyFilter = () => {
      const typeVal = typeFilter.value;
      const statusVal = statusFilter.value;

      const filtered = allInquiries.filter(item => {
        const matchType = typeVal === 'all' || item.inquiry_type === typeVal;
        const matchStatus = statusVal === 'all' || item.status === statusVal;
        return matchType && matchStatus;
      });

      tbody.innerHTML = this.renderInquiryRows(filtered);
    };

    typeFilter.addEventListener('change', applyFilter);
    statusFilter.addEventListener('change', applyFilter);
  },

  renderInquiryRows(inquiries) {
    if (inquiries.length === 0) {
      return `<tr><td colspan="7" style="text-align: center; color: #9CA3AF; padding: 30px;">Tidak ada inquiry sesuai filter.</td></tr>`;
    }

    return inquiries.map(inq => `
      <tr>
        <td>#${inq.id}</td>
        <td>${formatTanggal(inq.created_at)}</td>
        <td>
          <strong>${inq.customer_name}</strong><br>
          <span style="font-size: 0.82rem; color: #4B5563;">WA: ${inq.whatsapp}</span>
          ${inq.email ? `<br><span style="font-size: 0.78rem; color: #6B7280;">${inq.email}</span>` : ''}
        </td>
        <td>
          <span class="badge-heritage" style="padding: 2px 8px; font-size: 0.72rem;">${inq.inquiry_type === 'wedding' ? 'Wedding Venue' : 'Umum'}</span><br>
          <span style="font-size: 0.82rem;">${inq.event_type || '-'}</span>
        </td>
        <td>
          ${inq.event_date ? `<strong>${formatTanggal(inq.event_date)}</strong>` : '-'}<br>
          <span style="font-size: 0.82rem; color: #6B7280;">${inq.guest_count ? inq.guest_count + ' Pax' : '-'}</span>
        </td>
        <td>
          <select onchange="AdminApp.updateInquiryStatus(${inq.id}, this.value)" class="filter-select" style="padding: 4px 8px; font-size: 0.78rem;">
            <option value="new" ${inq.status === 'new' ? 'selected' : ''}>Baru</option>
            <option value="in_review" ${inq.status === 'in_review' ? 'selected' : ''}>Sedang Ditinjau</option>
            <option value="responded" ${inq.status === 'responded' ? 'selected' : ''}>Ditanggapi</option>
            <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Selesai</option>
          </select>
        </td>
        <td>
          <button onclick="AdminApp.viewInquiryDetail(${inq.id})" class="btn-action-icon" title="Detail Lengkap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <a href="${this.generateWhatsAppUrl(inq)}" target="_blank" class="btn-action-icon" title="Chat WhatsApp Sekarang" style="color: #25D366;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
          <button onclick="AdminApp.deleteInquiry(${inq.id})" class="btn-action-icon danger" title="Hapus">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  },

  async viewInquiryDetail(id) {
    const res = await API.get(`/inquiries/${id}`).catch(() => ({ data: null }));
    const inq = res.data;
    if (!inq) return;

    this.openModal(`Detail Inquiry #${inq.id} — ${inq.customer_name}`, `
      <div style="font-size: 0.95rem; line-height: 1.6;">
        <div style="background-color: #F9FAFB; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
          <p style="margin-bottom: 6px;"><strong>Nama Pelanggan:</strong> ${inq.customer_name}</p>
          <p style="margin-bottom: 6px;"><strong>WhatsApp:</strong> <a href="${this.generateWhatsAppUrl(inq)}" target="_blank" style="color: #25D366; font-weight: 700;">${inq.whatsapp} (Klik untuk Chat)</a></p>
          <p style="margin-bottom: 6px;"><strong>Email:</strong> ${inq.email || '-'}</p>
          <p style="margin-bottom: 6px;"><strong>Tipe Inquiry:</strong> ${inq.inquiry_type === 'wedding' ? 'Wedding & Event Venue' : 'Pertanyaan Umum'}</p>
          <p style="margin-bottom: 6px;"><strong>Kategori Acara:</strong> ${inq.event_type || '-'}</p>
          <p style="margin-bottom: 6px;"><strong>Rencana Tanggal:</strong> ${inq.event_date ? formatTanggal(inq.event_date) : '-'}</p>
          <p style="margin-bottom: 0;"><strong>Estimasi Tamu:</strong> ${inq.guest_count ? inq.guest_count + ' Pax' : '-'}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 1rem; color: var(--color-dark-walnut); margin-bottom: 6px;">Isi Pesan Pelanggan:</h4>
          <div style="background-color: #fff; border: 1px solid #E5E7EB; padding: 14px; border-radius: var(--radius-md); white-space: pre-wrap; color: #1F2937;">${inq.message}</div>
        </div>

        <form id="update-inquiry-notes-form">
          <div class="form-group">
            <label class="form-label">Catatan Internal Pengelola</label>
            <textarea name="notes" class="form-control" rows="3" placeholder="Tuliskan catatan tindak lanjut, kesepakatan survei, dll...">${inq.notes || ''}</textarea>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <a href="${this.generateWhatsAppUrl(inq)}" target="_blank" class="btn btn-whatsapp" style="padding: 8px 16px; font-size: 0.9rem;">
              Buka WhatsApp Sekarang
            </a>
            <button type="submit" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.9rem;">Simpan Catatan</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById('update-inquiry-notes-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const notes = e.target.notes.value;
      try {
        await API.put(`/inquiries/${id}`, { notes });
        API.showToast('Catatan inquiry berhasil disimpan!', 'success');
        this.closeModal();
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async updateInquiryStatus(id, newStatus) {
    try {
      await API.put(`/inquiries/${id}`, { status: newStatus });
      API.showToast(`Status inquiry berhasil diperbarui menjadi ${this.translateStatus(newStatus)}`, 'success');
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  async deleteInquiry(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan inquiry ini?')) return;
    try {
      await API.delete(`/inquiries/${id}`);
      API.showToast('Inquiry berhasil dihapus.', 'info');
      this.renderInquiriesView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  generateWhatsAppUrl(inq) {
    let rawPhone = (inq.whatsapp || '').replace(/\D/g, '');
    if (rawPhone.startsWith('0')) {
      rawPhone = '62' + rawPhone.slice(1);
    } else if (!rawPhone.startsWith('62')) {
      rawPhone = '62' + rawPhone;
    }

    const greeting = encodeURIComponent(
      `Halo Bapak/Ibu ${inq.customer_name}, terima kasih telah menghubungi Angkringan Widoro Klaten melalui website kami terkait ${inq.event_type || 'pengajuan acara'}. Apakah ada informasi ketersediaan tanggal atau paket yang dapat kami bantu lebih lanjut?`
    );

    return `https://wa.me/${rawPhone}?text=${greeting}`;
  },

  translateStatus(status) {
    const map = {
      new: 'Baru',
      in_review: 'Sedang Ditinjau',
      responded: 'Ditanggapi',
      closed: 'Selesai'
    };
    return map[status] || status;
  },

  // ========================================================
  // SUBVIEW: TESTIMONIALS MANAGEMENT
  // ========================================================
  async renderTestimonialsView(container) {
    document.title = 'Manajemen Testimoni — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Kelola Testimoni & Ulasan';

    const res = await API.get('/testimonials').catch(() => ({ data: [] }));
    const items = res.data || [];

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Daftar Testimoni Pelanggan (${items.length})</h3>
          <button onclick="AdminApp.openAddTestimonialModal()" class="btn btn-secondary" style="font-size: 0.88rem; padding: 8px 16px;">
            + Tambah Testimoni Baru
          </button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>Peran / Acara</th>
                <th>Kutipan Ulasan</th>
                <th>Bintang</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(t => `
                <tr>
                  <td><strong>${t.customer_name}</strong></td>
                  <td>${t.customer_role_or_event || '-'}</td>
                  <td><span style="font-size: 0.85rem; font-style: italic;">"${t.quote.substring(0, 60)}..."</span></td>
                  <td style="color: #F5A623;">${'★'.repeat(t.rating)}</td>
                  <td>
                    <span class="status-pill ${t.is_published ? 'published' : 'draft'}">
                      ${t.is_published ? 'Tayang' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button onclick="AdminApp.deleteTestimonial(${t.id})" class="btn-action-icon danger" title="Hapus">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openAddTestimonialModal() {
    this.openModal('Tambah Testimoni Baru', `
      <form id="add-test-form">
        <div class="form-group">
          <label class="form-label">Nama Pelanggan / Tamu <span class="req">*</span></label>
          <input type="text" name="customer_name" class="form-control" placeholder="Contoh: Aditya Pratama & Dian Larasati" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Peran / Kategori Acara</label>
            <input type="text" name="customer_role_or_event" class="form-control" placeholder="Contoh: Pasangan Resepsi Wedding (Paket Kebon Widoro)">
          </div>
          <div class="form-group">
            <label class="form-label">Rating Bintang (1 - 5) <span class="req">*</span></label>
            <select name="rating" class="form-control" required>
              <option value="5" selected>5 Bintang (Sangat Puas)</option>
              <option value="4">4 Bintang (Puas)</option>
              <option value="3">3 Bintang (Cukup)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Kutipan Ulasan / Testimoni <span class="req">*</span></label>
          <textarea name="quote" class="form-control" rows="4" placeholder="Ceritakan pengalaman kepuasan pelanggan..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Simpan Testimoni</button>
      </form>
    `);

    document.getElementById('add-test-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = {
        customer_name: formData.get('customer_name'),
        customer_role_or_event: formData.get('customer_role_or_event'),
        quote: formData.get('quote'),
        rating: parseInt(formData.get('rating')),
        is_published: 1
      };

      try {
        await API.post('/testimonials', payload);
        API.showToast('Testimoni baru berhasil ditambahkan!', 'success');
        this.closeModal();
        this.renderTestimonialsView(document.getElementById('admin-view-content'));
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  async deleteTestimonial(id) {
    if (!confirm('Hapus ulasan testimoni ini?')) return;
    try {
      await API.delete(`/testimonials/${id}`);
      API.showToast('Testimoni berhasil dihapus.', 'info');
      this.renderTestimonialsView(document.getElementById('admin-view-content'));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  },

  // ========================================================
  // SUBVIEW: WEBSITE CONTENT MANAGEMENT (CMS)
  // ========================================================
  async renderWebsiteContentView(container) {
    document.title = 'Konten Website CMS — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'CMS Konten Website Publik';

    const content = await API.get('/content').catch(() => ({}));
    const hero = content.hero || {};
    const heroMeta = hero.metadata || {};
    const about = content.about || {};
    const contact = content.contact_info || {};
    const contactMeta = contact.metadata || {};

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Pengaturan Teks Beranda (Homepage Hero)</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="cms-hero-form">
            <div class="form-group">
              <label class="form-label">Tagline Hero Banner</label>
              <input type="text" name="tagline" class="form-control" value="${heroMeta.tagline || 'Nguliner Neng Kebon'}">
            </div>
            <div class="form-group">
              <label class="form-label">Judul Utama (Headline)</label>
              <input type="text" name="title" class="form-control" value="${hero.title || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Teks Pendukung (Subtitle)</label>
              <textarea name="subtitle" class="form-control" rows="2">${hero.subtitle || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Perbarui Beranda</button>
          </form>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Konten Halaman Tentang Kami (About Us)</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="cms-about-form">
            <div class="form-group">
              <label class="form-label">Judul Kisah</label>
              <input type="text" name="title" class="form-control" value="${about.title || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Subjudul</label>
              <input type="text" name="subtitle" class="form-control" value="${about.subtitle || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Teks Narasi Kisah Lengkap</label>
              <textarea name="content" class="form-control" rows="6">${about.content || ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">Perbarui Tentang Kami</button>
          </form>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Informasi Alamat, Kontak & Jam Operasional</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="cms-contact-form">
            <div class="form-group">
              <label class="form-label">Alamat Lengkap</label>
              <input type="text" name="address" class="form-control" value="${contactMeta.address || ''}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nomor WhatsApp Pengelola</label>
                <input type="text" name="whatsapp" class="form-control" value="${contactMeta.whatsapp || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Akun Instagram</label>
                <input type="text" name="instagram" class="form-control" value="${contactMeta.instagram || ''}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Jam Buka Senin – Jumat</label>
                <input type="text" name="hours_weekdays" class="form-control" value="${contactMeta.operating_hours_weekdays || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Jam Buka Sabtu – Minggu</label>
                <input type="text" name="hours_weekends" class="form-control" value="${contactMeta.operating_hours_weekends || ''}">
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Simpan Informasi Kontak</button>
          </form>
        </div>
      </div>
    `;

    // Handle Hero Submit
    container.querySelector('#cms-hero-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const meta = { ...(hero.metadata || {}), tagline: f.get('tagline') };
      try {
        await API.put('/content/hero', {
          title: f.get('title'),
          subtitle: f.get('subtitle'),
          content: hero.content,
          metadata_json: JSON.stringify(meta)
        });
        API.showToast('Konten Beranda berhasil diperbarui!', 'success');
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Handle About Submit
    container.querySelector('#cms-about-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await API.put('/content/about', {
          title: f.get('title'),
          subtitle: f.get('subtitle'),
          content: f.get('content'),
          metadata_json: JSON.stringify(about.metadata || {})
        });
        API.showToast('Konten Tentang Kami berhasil diperbarui!', 'success');
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Handle Contact Submit
    container.querySelector('#cms-contact-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const newMeta = {
        ...(contact.metadata || {}),
        address: f.get('address'),
        whatsapp: f.get('whatsapp'),
        instagram: f.get('instagram'),
        operating_hours_weekdays: f.get('hours_weekdays'),
        operating_hours_weekends: f.get('hours_weekends')
      };
      try {
        await API.put('/content/contact_info', {
          title: contact.title || 'Kontak Kami',
          subtitle: contact.subtitle || '',
          content: contact.content || '',
          metadata_json: JSON.stringify(newMeta)
        });
        API.showToast('Informasi Kontak berhasil disimpan!', 'success');
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  // ========================================================
  // SUBVIEW: SETTINGS
  // ========================================================
  renderSettingsView(container) {
    document.title = 'Pengaturan Akun — Angkringan Widoro';
    document.getElementById('admin-page-title').innerText = 'Pengaturan Akun & Sistem';

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Profil Pengelola</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="admin-profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Pengelola</label>
                <input type="text" name="name" class="form-control" value="${this.currentUser.name || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-control" value="${this.currentUser.email || ''}" required>
              </div>
            </div>
            <button type="submit" class="btn btn-primary">Simpan Profil</button>
          </form>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Ubah Kata Sandi (Password)</h3>
        </div>
        <div style="padding: var(--spacing-xl);">
          <form id="admin-password-form">
            <div class="form-group">
              <label class="form-label">Kata Sandi Saat Ini</label>
              <input type="password" name="current_password" class="form-control" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kata Sandi Baru</label>
                <input type="password" name="new_password" class="form-control" required minlength="6">
              </div>
              <div class="form-group">
                <label class="form-label">Ulangi Kata Sandi Baru</label>
                <input type="password" name="confirm_password" class="form-control" required minlength="6">
              </div>
            </div>
            <button type="submit" class="btn btn-secondary">Perbarui Kata Sandi</button>
          </form>
        </div>
      </div>

      <div class="admin-card">
        <div class="admin-card-header">
          <h3 class="admin-card-title">Status Sistem & Basis Data</h3>
        </div>
        <div style="padding: var(--spacing-xl); font-size: 0.9rem; color: #4B5563;">
          <p style="margin-bottom: 6px;"><strong>Database:</strong> SQLite Relasional / Cloudflare D1 Compatible</p>
          <p style="margin-bottom: 6px;"><strong>Arsitektur:</strong> Single Deployment, Unified Shared Database</p>
          <p style="margin-bottom: 0;"><strong>Deployment Target:</strong> Cloudflare Pages & Functions</p>
        </div>
      </div>
    `;

    // Handle Profile Update
    container.querySelector('#admin-profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const res = await API.put('/auth/profile', {
          name: f.get('name'),
          email: f.get('email')
        });
        this.currentUser = res.user;
        API.showToast('Profil pengelola berhasil disimpan!', 'success');
        this.renderAdminPage('/admin/settings');
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Handle Password Update
    container.querySelector('#admin-password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const cur = f.get('current_password');
      const nw = f.get('new_password');
      const cf = f.get('confirm_password');

      if (nw !== cf) {
        API.showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
        return;
      }

      try {
        await API.put('/auth/profile', {
          current_password: cur,
          new_password: nw
        });
        API.showToast('Kata sandi berhasil diperbarui!', 'success');
        e.target.reset();
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  },

  // ========================================================
  // MODAL UTILITY
  // ========================================================
  openModal(title, bodyHtml) {
    const modal = document.getElementById('admin-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (modal && titleEl && bodyEl) {
      titleEl.innerText = title;
      bodyEl.innerHTML = bodyHtml;
      modal.classList.add('active');
    }
  },

  closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
  }
};

// Initialize Admin App on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
