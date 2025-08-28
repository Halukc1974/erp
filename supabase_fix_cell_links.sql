-- SADECE EKSİK KOLONU EKLE
-- Bu sorguyu Supabase SQL Editor'de çalıştır

-- cell_links tablosuna user_id kolonu ekle (isteğe bağlı - kod tarafında kullanılmıyor artık)
-- ALTER TABLE cell_links ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Ama aslında kodda user_id kullanımını kaldırdık, bu yüzden bu kolon gerekli olmayabilir.
-- Önce mevcut durumu kontrol edelim:

SELECT 'Mevcut cell_links yapısı:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cell_links' 
ORDER BY ordinal_position;

-- Eğer user_id kolonu yoksa ve kod hata veriyorsa, ekleyelim:
-- ALTER TABLE cell_links ADD COLUMN user_id TEXT DEFAULT 'system';
