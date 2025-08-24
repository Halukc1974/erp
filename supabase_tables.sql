-- SUPABASE SQL TABLES - Finanstakip ERP System
-- Bu SQL kodlarını Supabase SQL Editor'de çalıştırın

-- MEVCUT DYNAMIC_TABLES: ID=INTEGER (Değiştirmeyin!)
-- Mevcut dynamic_tables yapısı korunacak

-- 1. Dynamic Columns tablosu (EKSIK - Bu önemli!)
CREATE TABLE IF NOT EXISTS dynamic_columns (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES dynamic_tables(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    data_type VARCHAR NOT NULL, -- text, number, date, decimal, boolean, checkbox, select
    is_required BOOLEAN DEFAULT false,
    is_editable BOOLEAN DEFAULT true,
    default_value TEXT,
    options TEXT, -- JSON array for select options
    width INTEGER DEFAULT 150,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dynamic Table Data tablosu (EKSIK - Bu da önemli!)
CREATE TABLE IF NOT EXISTS dynamic_table_data (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES dynamic_tables(id) ON DELETE CASCADE,
    row_data JSONB NOT NULL, -- Stores all column values as JSON
    user_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cell Links tablosu (EKSIK - Cell linking için gerekli!)
CREATE TABLE IF NOT EXISTS cell_links (
    id SERIAL PRIMARY KEY,
    source_table_id INTEGER REFERENCES dynamic_tables(id) ON DELETE CASCADE,
    source_row_id INTEGER REFERENCES dynamic_table_data(id) ON DELETE CASCADE,
    source_column_name VARCHAR(100) NOT NULL,
    target_table_name VARCHAR(100) NOT NULL, -- accounts, customers, suppliers etc.
    target_row_id VARCHAR NOT NULL, -- Hedef satır ID'si
    target_field_name VARCHAR(100) NOT NULL, -- name, code, phone etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sessions tablosu (Replit Auth için gerekli)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Index'ler - Performans için önemli
CREATE INDEX IF NOT EXISTS idx_dynamic_columns_table_id ON dynamic_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_table_data_table_id ON dynamic_table_data(table_id);
CREATE INDEX IF NOT EXISTS idx_cell_links_source_table ON cell_links(source_table_id);
CREATE INDEX IF NOT EXISTS idx_cell_links_target_table ON cell_links(target_table_name);
CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- İsteğe bağlı: Bazı temel tablolar eksikse onları da ekleyelim
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Komple tablo listesi kontrol için:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;