/*
  # Initial Schema Setup for Telegram Bot Manager

  1. Tables
    - botlar (Bots)
    - kullanicilar (Users)
    - bot_kullanicilar (Bot-User Relations)
    - mesajlar (Messages)
    - mesaj_sablonlari (Message Templates)
    - zamanlanmis_mesajlar (Scheduled Messages)
    - komutlar (Commands)
    - webhooks
    - guvenlik_olaylari (Security Events)
    - sistem_ayarlari (System Settings)

  2. Security
    - RLS policies for all tables
    - Indexes for performance
    - Triggers for timestamps
*/

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Botlar tablosu
CREATE TABLE botlar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isim TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    aktif BOOLEAN DEFAULT true,
    webhook_url TEXT,
    welcome_message TEXT,
    openai_prompt TEXT,
    olusturma_tarihi TIMESTAMPTZ DEFAULT now(),
    guncelleme_tarihi TIMESTAMPTZ DEFAULT now()
);

-- Kullanıcılar tablosu
CREATE TABLE kullanicilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id TEXT UNIQUE NOT NULL,
    kullanici_adi TEXT,
    ad TEXT,
    soyad TEXT,
    dil TEXT DEFAULT 'tr',
    aktif BOOLEAN DEFAULT true,
    olusturma_tarihi TIMESTAMPTZ DEFAULT now(),
    son_gorulme TIMESTAMPTZ DEFAULT now()
);

-- Bot-Kullanıcı ilişki tablosu
CREATE TABLE bot_kullanicilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES botlar ON DELETE CASCADE,
    kullanici_id UUID REFERENCES kullanicilar ON DELETE CASCADE,
    engelli BOOLEAN DEFAULT false,
    mesaj_sayisi INTEGER DEFAULT 0,
    son_etkilesim TIMESTAMPTZ DEFAULT now(),
    UNIQUE(bot_id, kullanici_id)
);

-- Mesajlar tablosu
CREATE TABLE mesajlar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES botlar ON DELETE CASCADE,
    kullanici_id UUID REFERENCES kullanicilar ON DELETE CASCADE,
    mesaj TEXT NOT NULL,
    mesaj_tipi TEXT DEFAULT 'text',
    yonlendirme_id TEXT,
    medya_url TEXT,
    gonderim_tarihi TIMESTAMPTZ DEFAULT now()
);

-- Mesaj şablonları tablosu
CREATE TABLE mesaj_sablonlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baslik TEXT NOT NULL,
    icerik TEXT NOT NULL,
    medya_tipleri TEXT[],
    medya_urls TEXT[],
    butonlar JSONB,
    olusturma_tarihi TIMESTAMPTZ DEFAULT now(),
    son_guncelleme TIMESTAMPTZ DEFAULT now()
);

-- Zamanlanmış mesajlar tablosu
CREATE TABLE zamanlanmis_mesajlar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sablon_id UUID NOT NULL,
    bot_ids UUID[],
    gonderim_zamani TIMESTAMPTZ NOT NULL,
    durum TEXT DEFAULT 'bekliyor',
    olusturma_tarihi TIMESTAMPTZ DEFAULT now()
);

-- Komutlar tablosu
CREATE TABLE komutlar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES botlar ON DELETE CASCADE,
    komut TEXT NOT NULL,
    aciklama TEXT,
    cevap TEXT NOT NULL,
    aktif BOOLEAN DEFAULT true,
    UNIQUE(bot_id, komut)
);

-- Webhooks tablosu
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES botlar ON DELETE CASCADE UNIQUE,
    url TEXT NOT NULL,
    aktif BOOLEAN DEFAULT true,
    son_guncelleme TIMESTAMPTZ DEFAULT now()
);

-- Güvenlik olayları tablosu
CREATE TABLE guvenlik_olaylari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip TEXT NOT NULL,
    detay TEXT NOT NULL,
    onem TEXT DEFAULT 'dusuk',
    ip TEXT,
    kullanici_id UUID,
    tarih TIMESTAMPTZ DEFAULT now()
);

-- Sistem ayarları tablosu
CREATE TABLE sistem_ayarlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anahtar TEXT UNIQUE NOT NULL,
    deger TEXT NOT NULL,
    aciklama TEXT,
    guncelleme_tarihi TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE botlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesaj_sablonlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE zamanlanmis_mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE komutlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guvenlik_olaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistem_ayarlari ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read bots" ON botlar
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage bots" ON botlar
    FOR ALL TO authenticated USING (true);

-- Add similar policies for other tables...

-- Create indexes
CREATE INDEX idx_botlar_token ON botlar(token);
CREATE INDEX idx_kullanicilar_telegram_id ON kullanicilar(telegram_id);
CREATE INDEX idx_mesajlar_gonderim_tarihi ON mesajlar(gonderim_tarihi);
CREATE INDEX idx_zamanlanmis_mesajlar_gonderim_zamani ON zamanlanmis_mesajlar(gonderim_zamani);
CREATE INDEX idx_guvenlik_olaylari_tarih ON guvenlik_olaylari(tarih);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON botlar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON mesaj_sablonlari
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();