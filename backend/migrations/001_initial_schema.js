const { pool } = require('../config/database');

const up = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Extensions
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`);

    // Enums
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ─── Users ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(15),
        role user_role DEFAULT 'buyer',
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Seller Profiles ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(200) NOT NULL,
        description TEXT,
        gstin VARCHAR(15),
        pan_number VARCHAR(10),
        bank_account VARCHAR(20),
        bank_ifsc VARCHAR(11),
        bank_name VARCHAR(100),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(6),
        district VARCHAR(100),
        verification verification_status DEFAULT 'pending',
        verified_at TIMESTAMPTZ,
        rating DECIMAL(3,2) DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        total_revenue DECIMAL(12,2) DEFAULT 0,
        craft_speciality VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Buyer Addresses ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS buyer_addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        label VARCHAR(50) DEFAULT 'Home',
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(6) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── ODOP Dataset ───────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS odop_dataset (
        id SERIAL PRIMARY KEY,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        gi_tag BOOLEAN DEFAULT false,
        UNIQUE(state, district, product_name)
      );
    `);

    // ─── Districts (with geolocation for map) ───────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS districts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        description TEXT,
        image_url TEXT,
        famous_for TEXT,
        UNIQUE(name, state)
      );
    `);

    // ─── Products ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(250) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        short_description VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        cost_price DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        sku VARCHAR(50),
        images JSONB DEFAULT '[]',
        thumbnail TEXT,
        weight DECIMAL(8,2),
        dimensions JSONB,
        materials TEXT,
        care_instructions TEXT,
        state VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        odop_verified BOOLEAN DEFAULT false,
        odop_product_name VARCHAR(200),
        gi_tagged BOOLEAN DEFAULT false,
        is_handmade BOOLEAN DEFAULT true,
        artisan_story TEXT,
        making_time VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        bulk_available BOOLEAN DEFAULT false,
        min_bulk_qty INTEGER,
        bulk_price DECIMAL(10,2),
        tags JSONB DEFAULT '[]',
        avg_rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Cart Items ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        is_bulk BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);

    // ─── Orders ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(20) UNIQUE NOT NULL,
        buyer_id UUID NOT NULL REFERENCES users(id),
        shipping_address JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping_fee DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status order_status DEFAULT 'pending',
        payment_status payment_status DEFAULT 'pending',
        notes TEXT,
        is_bulk_order BOOLEAN DEFAULT false,
        cancelled_reason TEXT,
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Order Items ────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        seller_id UUID NOT NULL REFERENCES users(id),
        product_name VARCHAR(200) NOT NULL,
        product_image TEXT,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status order_status DEFAULT 'pending',
        tracking_number VARCHAR(100),
        shipped_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ
      );
    `);

    // ─── Payments ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id),
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status payment_status DEFAULT 'pending',
        method VARCHAR(50),
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Seller Payouts ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_payouts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID NOT NULL REFERENCES users(id),
        order_item_id UUID REFERENCES order_items(id),
        amount DECIMAL(10,2) NOT NULL,
        platform_fee DECIMAL(10,2) DEFAULT 0,
        net_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Reviews ────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        comment TEXT,
        images JSONB DEFAULT '[]',
        is_verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, user_id, order_id)
      );
    `);

    // ─── Wishlist ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `);

    // ─── Support Tickets ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id),
        subject VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status ticket_status DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Ticket Messages ────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Notifications ──────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Product Views (Analytics) ──────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Cultural Knowledge Hub ─────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS cultural_articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(300) NOT NULL,
        slug VARCHAR(350) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        cover_image TEXT,
        state VARCHAR(100),
        district VARCHAR(100),
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        author_id UUID REFERENCES users(id),
        is_published BOOLEAN DEFAULT true,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Indexes ────────────────────────────────────────
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_state ON products(state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_district ON products(district);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_odop_state ON odop_dataset(state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_odop_district ON odop_dataset(district);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cultural_slug ON cultural_articles(slug);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cultural_state ON cultural_articles(state);`);

    // Full-text search index on products
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_search 
      ON products USING gin(
        (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || coalesce(state, '') || ' ' || coalesce(district, '')))
      );
    `);

    // Trigram index for fuzzy search
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);`);

    // ─── Triggers ───────────────────────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ language 'plpgsql';
    `);

    const tablesWithUpdatedAt = ['users', 'seller_profiles', 'products', 'orders', 'support_tickets', 'cultural_articles'];
    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

const down = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tables = [
      'product_views', 'ticket_messages', 'support_tickets', 'notifications',
      'cultural_articles', 'wishlist', 'reviews', 'seller_payouts', 'payments',
      'order_items', 'orders', 'cart_items', 'products', 'districts',
      'odop_dataset', 'buyer_addresses', 'seller_profiles', 'users'
    ];
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
    await client.query(`DROP TYPE IF EXISTS user_role CASCADE`);
    await client.query(`DROP TYPE IF EXISTS verification_status CASCADE`);
    await client.query(`DROP TYPE IF EXISTS order_status CASCADE`);
    await client.query(`DROP TYPE IF EXISTS payment_status CASCADE`);
    await client.query(`DROP TYPE IF EXISTS ticket_status CASCADE`);
    await client.query('COMMIT');
    console.log('✅ All tables dropped');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { up, down };
