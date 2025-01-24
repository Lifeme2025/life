import { Request, Response } from 'express';
import { prisma } from '../services';

class StatsController {
  async getStats(req: Request, res: Response) {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Son 24 saatteki mesajları saatlik olarak grupla
      const mesajTrendi = await prisma.mesaj.groupBy({
        by: ['gonderim_tarihi'],
        _count: {
          id: true
        },
        where: {
          gonderim_tarihi: {
            gte: twentyFourHoursAgo
          }
        },
        orderBy: {
          gonderim_tarihi: 'asc'
        }
      });

      // Bot performans istatistikleri
      const botPerformans = await prisma.bot.findMany({
        select: {
          id: true,
          isim: true,
          _count: {
            select: {
              mesajlar: true,
              kullanicilar: true
            }
          }
        }
      });

      // Genel istatistikler
      const genelIstatistikler = {
        toplam_bot: await prisma.bot.count(),
        toplam_kullanici: await prisma.kullanici.count(),
        toplam_mesaj: await prisma.mesaj.count(),
        aktif_kullanicilar: await prisma.kullanici.count({
          where: {
            son_gorulme: {
              gte: twentyFourHoursAgo
            }
          }
        })
      };

      return res.json({
        mesaj_trendi: mesajTrendi,
        bot_performans: botPerformans,
        genel_istatistikler: genelIstatistikler
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export const statsController = new StatsController();