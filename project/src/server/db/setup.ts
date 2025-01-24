import { logController } from '../controllers/LogController';

interface Bot {
  id: number;
  isim: string;
  token: string;
  aktif: boolean;
  webhook_url?: string;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

interface Yonetici {
  id: number;
  kullanici_adi: string;
  sifre_hash: string;
  olusturma_tarihi: string;
}

interface Kullanici {
  id: number;
  telegram_id: number;
  kullanici_adi?: string;
  ad?: string;
  soyad?: string;
  aktif: boolean;
  olusturma_tarihi: string;
  son_etkilesim: string;
}

interface Mesaj {
  id: number;
  bot_id: number;
  kullanici_id: number;
  mesaj_tipi: string;
  icerik: string;
  gonderim_tarihi: string;
}

class InMemoryDB {
  private botlar: Map<number, Bot>;
  private yoneticiler: Map<number, Yonetici>;
  private kullanicilar: Map<number, Kullanici>;
  private mesajlar: Map<number, Mesaj>;
  private autoIncrementIds: { [key: string]: number };

  constructor() {
    this.botlar = new Map();
    this.yoneticiler = new Map();
    this.kullanicilar = new Map();
    this.mesajlar = new Map();
    
    this.autoIncrementIds = {
      botlar: 0,
      yoneticiler: 0,
      kullanicilar: 0,
      mesajlar: 0
    };
    
    logController.addLog('info', 'Bellek içi veritabanı başlatıldı');
  }

  // Yönetici metodları
  insertYonetici(kullanici_adi: string, sifre_hash: string): Yonetici {
    const id = ++this.autoIncrementIds.yoneticiler;
    const yonetici: Yonetici = {
      id,
      kullanici_adi,
      sifre_hash,
      olusturma_tarihi: new Date().toISOString()
    };
    this.yoneticiler.set(id, yonetici);
    logController.addLog('info', `Yönetici oluşturuldu: ${kullanici_adi}`);
    return yonetici;
  }

  getYoneticiByKullaniciAdi(kullanici_adi: string): Yonetici | undefined {
    return Array.from(this.yoneticiler.values()).find(
      y => y.kullanici_adi === kullanici_adi
    );
  }

  deleteYonetici(id: number): boolean {
    return this.yoneticiler.delete(id);
  }

  // Bot metodları
  insertBot(isim: string, token: string): Bot {
    const id = ++this.autoIncrementIds.botlar;
    const bot: Bot = {
      id,
      isim,
      token,
      aktif: true,
      olusturma_tarihi: new Date().toISOString(),
      guncelleme_tarihi: new Date().toISOString()
    };
    this.botlar.set(id, bot);
    return bot;
  }

  getAllBots(): Bot[] {
    return Array.from(this.botlar.values());
  }

  getBot(id: number): Bot | undefined {
    return this.botlar.get(id);
  }

  updateBotStatus(id: number, aktif: boolean): Bot | undefined {
    const bot = this.botlar.get(id);
    if (bot) {
      bot.aktif = aktif;
      bot.guncelleme_tarihi = new Date().toISOString();
      this.botlar.set(id, bot);
      return bot;
    }
    return undefined;
  }

  deleteBot(id: number): boolean {
    return this.botlar.delete(id);
  }
}

export const db = new InMemoryDB();