/*
  # Initial Schema for Telegram Bot Manager

  1. Tables
    - botlar (Telegram botları)
    - kullanicilar (Bot kullanıcıları)
    - bot_kullanicilar (Bot-kullanıcı ilişkileri)
    - mesajlar (Tüm mesaj geçmişi)
    - mesaj_sablonlari (Önceden hazırlanmış mesajlar)
    - zamanlanmis_mesajlar (İleri tarihli mesajlar)
    - komutlar (Bot komutları)
    - webhooks (Bot webhook ayarları)
    - guvenlik_olaylari (Güvenlik logları)
    - sistem_ayarlari (Sistem konfigürasyonu)

  2. Relations
    - Bot-Kullanıcı many-to-many ilişkisi
    - Bot-Mesaj one-to-many ilişkisi
    - Bot-Komut one-to-many ilişkisi
    - Bot-Webhook one-to-one ilişkisi

  3. Indexes
    - Performans için gerekli indexler
    - Unique kısıtlamalar

  4. Security
    - RLS politikaları
*/

-- Botlar tablosu
CREATE TABLE botlar (
    id SERIAL PRIMARY KEY,
    isim VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    aktif BOOLEAN DEFAULT true,
    webhook_url TEXT,
    welcome_message TEXT,
    openai_prompt TEXT,
    olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcılar tablosu
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    telegram_id VARCHAR(255) UNIQUE NOT NULL,
    kullanici_adi VARCHAR(255),
    ad VARCHAR(255),
    soyad VARCHAR(255),
    dil VARCHAR(10) DEFAULT 'tr',
    aktif BOOLEAN DEFAULT true,
    olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    son_gorulme TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bot-Kullanıcı ilişki tablosu
CREATE TABLE bot_kullanicilar (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES botlar(id) ON DELETE CASCADE,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    engelli BOOLEAN DEFAULT false,
    mesaj_sayisi INTEGER DEFAULT 0,
    son_etkilesim TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bot_id, kullanici_id)
);

-- Mesajlar tablosu
CREATE TABLE mesajlar (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES botlar(id) ON DELETE CASCADE,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    mesaj TEXT NOT NULL,
    mesaj_tipi VARCHAR(50) DEFAULT 'text',
    yonlendirme_id VARCHAR(255),
    medya_url TEXT,
    gonderim_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mesaj şablonları tablosu
CREATE TABLE mesaj_sablonlari (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    icerik TEXT NOT NULL,
    medya_tipleri VARCHAR(50)[],
    medya_urls TEXT[],
    butonlar JSONB,
    olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    son_guncelleme TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zamanlanmış mesajlar tablosu
CREATE TABLE zamanlanmis_mesajlar (
    id SERIAL PRIMARY KEY,
    sablon_id INTEGER NOT NULL,
    bot_ids INTEGER[],
    gonderim_zamani TIMESTAMP WITH TIME ZONE NOT NULL,
    durum VARCHAR(50) DEFAULT 'bekliyor',
    olusturma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Komutlar tablosu
CREATE TABLE komutlar (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES botlar(id) ON DELETE CASCADE,
    komut VARCHAR(255) NOT NULL,
    aciklama TEXT,
    cevap TEXT NOT NULL,
    aktif BOOLEAN DEFAULT true,
    UNIQUE(bot_id, komut)
);

-- Webhooks tablosu
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    bot_id INTEGER REFERENCES botlar(id) ON DELETE CASCADE UNIQUE,
    url TEXT NOT NULL,
    aktif BOOLEAN DEFAULT true,
    son_guncelleme TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Güvenlik olayları tablosu
CREATE TABLE guvenlik_olaylari (
    id SERIAL PRIMARY KEY,
    tip VARCHAR(255) NOT NULL,
    detay TEXT NOT NULL,
    onem VARCHAR(50) DEFAULT 'dusuk',
    ip VARCHAR(45),
    kullanici_id INTEGER,
    tarih TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sistem ayarları tablosu
CREATE TABLE sistem_ayarlari (
    id SERIAL PRIMARY KEY,
    anahtar VARCHAR(255) UNIQUE NOT NULL,
    deger TEXT NOT NULL,
    aciklama TEXT,
    guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexler
CREATE INDEX idx_botlar_token ON botlar(token);
CREATE INDEX idx_kullanicilar_telegram_id ON kullanicilar(telegram_id);
CREATE INDEX idx_mesajlar_gonderim_tarihi ON mesajlar(gonderim_tarihi);
CREATE INDEX idx_zamanlanmis_mesajlar_gonderim_zamani ON zamanlanmis_mesajlar(gonderim_zamani);
CREATE INDEX idx_guvenlik_olaylari_tarih ON guvenlik_olaylari(tarih);

-- Trigger fonksiyonları
CREATE OR REPLACE FUNCTION update_guncelleme_tarihi()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggerlar
CREATE TRIGGER update_bot_guncelleme_tarihi
    BEFORE UPDATE ON botlar
    FOR EACH ROW
    EXECUTE FUNCTION update_guncelleme_tarihi();

CREATE TRIGGER update_mesaj_sablonu_guncelleme_tarihi
    BEFORE UPDATE ON mesaj_sablonlari
    FOR EACH ROW
    EXECUTE FUNCTION update_guncelleme_tarihi();

-- RLS Politikaları
ALTER TABLE botlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesaj_sablonlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE zamanlanmis_mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE komutlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guvenlik_olaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistem_ayarlari ENABLE ROW LEVEL SECURITY;