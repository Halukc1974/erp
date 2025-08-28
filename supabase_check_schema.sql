-- SUPABASE VERİTABANI DURUM KONTROLÜ
-- Bu sorguları Supabase SQL Editor'de çalıştırarak mevcut durumu kontrol edin

-- 1. Tablo yapılarını kontrol et
SELECT 'dynamic_tables yapısı:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'dynamic_tables' 
ORDER BY ordinal_position;

SELECT 'cell_links yapısı:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cell_links' 
ORDER BY ordinal_position;

SELECT 'dynamic_columns yapısı:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'dynamic_columns' 
ORDER BY ordinal_position;

SELECT 'dynamic_table_data yapısı:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'dynamic_table_data' 
ORDER BY ordinal_position;

-- 2. Kayıt sayılarını kontrol et
SELECT 'dynamic_tables' as tablo, count(*) as kayit_sayisi FROM dynamic_tables;
SELECT 'dynamic_columns' as tablo, count(*) as kayit_sayisi FROM dynamic_columns;
SELECT 'dynamic_table_data' as tablo, count(*) as kayit_sayisi FROM dynamic_table_data;
SELECT 'cell_links' as tablo, count(*) as kayit_sayisi FROM cell_links;
SELECT 'dynamic_cell_formulas' as tablo, count(*) as kayit_sayisi FROM dynamic_cell_formulas;

-- 3. Örnek veriler
SELECT 'dynamic_tables örnekleri:' as info;
SELECT id, name, is_active FROM dynamic_tables LIMIT 3;

SELECT 'cell_links örnekleri:' as info;
SELECT * FROM cell_links LIMIT 3;
