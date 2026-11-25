-- ========================================================
-- DATABASE SCHEMA: ANGKRINGAN WIDORO & WEDDING VENUE
-- Compatible with SQLite and Cloudflare D1
-- ========================================================

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Website Content (CMS)
CREATE TABLE IF NOT EXISTS website_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    metadata_json TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 4. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    price INTEGER DEFAULT 0,
    price_confirmed INTEGER DEFAULT 1,
    image_url TEXT,
    is_signature INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- 5. Venue Information
CREATE TABLE IF NOT EXISTS venue_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    capacity_seated INTEGER DEFAULT 350,
    capacity_standing INTEGER DEFAULT 600,
    indoor_area_desc TEXT,
    outdoor_area_desc TEXT,
    hero_image TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Venue Facilities
CREATE TABLE IF NOT EXISTS venue_facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_available INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
);

-- 7. Wedding Packages
CREATE TABLE IF NOT EXISTS wedding_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price INTEGER NOT NULL,
    pax INTEGER NOT NULL,
    description TEXT,
    inclusions_json TEXT,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
);

-- 8. Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'interior', 'food', 'atmosphere', 'wedding', 'venue'
    image_url TEXT NOT NULL,
    description TEXT,
    is_featured INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_role_or_event TEXT,
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    event_date TEXT,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Customer Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_type TEXT NOT NULL, -- 'wedding' or 'general'
    customer_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    event_type TEXT,
    event_date TEXT,
    guest_count INTEGER,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'in_review', 'responded', 'closed'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
