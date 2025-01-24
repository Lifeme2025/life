import { Request, Response } from 'express';
import { prisma } from '../services';
import { logController } from './LogController';

class GuvenlikController {
  async getGuvenlikDurumu(req: Request, res: Response) {
    try {
      const son_girisler = await prisma.guvenlikOlayi.findMany({
        where: {
          tip: 'giris_denemesi'
        },
        orderBy: {
          tarih: 'desc'
        },
        take: 50
      });

      const engellenen_ipler = await prisma.sistemAyari.findMany({
        where: {
          anahtar: {
            startsWith: 'blocked_ip:'
          }
        }
      });

      const guvenlik_olaylari = await prisma.guvenlikOlayi.findMany({
        orderBy: {
          tarih: 'desc'
        },
        take: 20
      });

      return res.json({
        son_girisler,
        engellenen_ipler: engellenen_ipler.map(ip => ({
          ip: ip.anahtar.replace('blocked_ip:', ''),
          sebep: ip.deger,
          tarih: ip.guncelleme_tarihi
        })),
        guvenlik_olaylari
      });
    } catch (error: any) {
      logController.addLog('error', `Güvenlik durumu alınırken hata: ${error.message}`);
      return res.status(500).json({ message: 'Güvenlik durumu alınamadı' });
    }
  }

  async ipEngelle(req: Request, res: Response) {
    const { ip, sebep } = req.body;

    try {
      await prisma.sistemAyari.create({
        data: {
          anahtar: `blocked_ip:${ip}`,
          deger: sebep || 'Manuel engelleme'
        }
      });

      logController.addLog('info', `IP engellendi: ${ip}`);
      return res.json({ message: 'IP başarıyla engellendi' });
    } catch (error: any) {
      logController.addLog('error', `IP engellenirken hata: ${error.message}`);
      return res.status(500).json({ message: 'IP engellenemedi' });
    }
  }

  async ipEngeliKaldir(req: Request, res: Response) {
    const { ip } = req.params;

    try {
      await prisma.sistemAyari.delete({
        where: {
          anahtar: `blocked_ip:${ip}`
        }
      });

      logController.addLog('info', `IP engeli kaldırıldı: ${ip}`);
      return res.json({ message: 'IP engeli başarıyla kaldırıldı' });
    } catch (error: any) {
      logController.addLog('error', `IP engeli kaldırılırken hata: ${error.message}`);
      return res.status(500).json({ message: 'IP engeli kaldırılamadı' });
    }
  }
}

export const guvenlikController = new GuvenlikController();