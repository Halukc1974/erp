-- SUPABASE UUID-Based Schema Update
-- Bu SQL kodları Supabase SQL Editor'de çalıştırılmalı

-- 1. cell_links tablosunu UUID referanslarıyla güncelleyecek şema
-- Önce mevcut tabloyu yedekle ve UUID referanslarıyla yeniden oluştur

-- ADIM 1: cell_links tablosuna user_id ekle (isteğe bağlı)
-- ALTER TABLE cell_links ADD COLUMN IF NOT EXISTS user_id TEXT;

-- ADIM 2: Tablo referanslarını UUID'lere dönüştür
-- Eğer dynamic_tables artık UUID kullanıyorsa, referansları güncelle

-- Mevcut cell_links yapısını kontrol et:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'cell_links';

-- dynamic_tables yapısını kontrol et:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'dynamic_tables';

-- Eğer dynamic_tables zaten UUID kullanıyorsa:
-- dynamic_columns için UUID referansları:
-- ALTER TABLE dynamic_columns DROP CONSTRAINT IF EXISTS dynamic_columns_table_id_fkey;
-- ALTER TABLE dynamic_columns ALTER COLUMN table_id TYPE UUID USING table_id::UUID;
-- ALTER TABLE dynamic_columns ADD CONSTRAINT dynamic_columns_table_id_fkey FOREIGN KEY (table_id) REFERENCES dynamic_tables(id);

-- dynamic_table_data için UUID referansları:
-- ALTER TABLE dynamic_table_data DROP CONSTRAINT IF EXISTS dynamic_table_data_table_id_fkey;
-- ALTER TABLE dynamic_table_data ALTER COLUMN table_id TYPE UUID USING table_id::UUID;
-- ALTER TABLE dynamic_table_data ADD CONSTRAINT dynamic_table_data_table_id_fkey FOREIGN KEY (table_id) REFERENCES dynamic_tables(id);

-- cell_links için UUID referansları:
-- ALTER TABLE cell_links DROP CONSTRAINT IF EXISTS cell_links_source_table_id_fkey;
-- ALTER TABLE cell_links DROP CONSTRAINT IF EXISTS cell_links_source_row_id_fkey;
-- ALTER TABLE cell_links ALTER COLUMN source_table_id TYPE UUID USING source_table_id::UUID;
-- ALTER TABLE cell_links ALTER COLUMN source_row_id TYPE UUID USING source_row_id::UUID;
-- ALTER TABLE cell_links ADD CONSTRAINT cell_links_source_table_id_fkey FOREIGN KEY (source_table_id) REFERENCES dynamic_tables(id);
-- ALTER TABLE cell_links ADD CONSTRAINT cell_links_source_row_id_fkey FOREIGN KEY (source_row_id) REFERENCES dynamic_table_data(id);

-- dynamic_cell_formulas için UUID referansları:
-- ALTER TABLE dynamic_cell_formulas DROP CONSTRAINT IF EXISTS dynamic_cell_formulas_table_id_fkey;
-- ALTER TABLE dynamic_cell_formulas DROP CONSTRAINT IF EXISTS dynamic_cell_formulas_row_id_fkey;
-- ALTER TABLE dynamic_cell_formulas ALTER COLUMN table_id TYPE UUID USING table_id::UUID;
-- ALTER TABLE dynamic_cell_formulas ALTER COLUMN row_id TYPE UUID USING row_id::UUID;
-- ALTER TABLE dynamic_cell_formulas ADD CONSTRAINT dynamic_cell_formulas_table_id_fkey FOREIGN KEY (table_id) REFERENCES dynamic_tables(id);
-- ALTER TABLE dynamic_cell_formulas ADD CONSTRAINT dynamic_cell_formulas_row_id_fkey FOREIGN KEY (row_id) REFERENCES dynamic_table_data(id);

-- Güvenli test sorguları:
SELECT 'dynamic_tables count' as info, count(*) as count FROM dynamic_tables;
SELECT 'dynamic_columns count' as info, count(*) as count FROM dynamic_columns;
SELECT 'dynamic_table_data count' as info, count(*) as count FROM dynamic_table_data;
SELECT 'cell_links count' as info, count(*) as count FROM cell_links;
SELECT 'dynamic_cell_formulas count' as info, count(*) as count FROM dynamic_cell_formulas WHERE created_at > NOW() - INTERVAL '1 day';

-- dynamic_tables yapısını kontrol et
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'dynamic_tables' 
ORDER BY ordinal_position;

-- cell_links yapısını kontrol et  
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cell_links' 
ORDER BY ordinal_position;
