import { Request, Response } from 'express';
import { prisma } from '../services';
import { logController } from './LogController';

class KullaniciController {
  async getKullanicilar(req: Request, res: Response) {
    try {
      const kullanicilar = await prisma.kullanici.findMany({
        include: {
          _count: {
            select: {
              mesajlar: true
            }
          }
        },
        orderBy: {
          son_gorulme: 'desc'
        }
      });

      return res.json(kullanicilar.map(k => ({
        ...k,
        mesaj_sayisi: k._count.mesajlar
      })));
    } catch (error: any) {
      logController.addLog('error', `Kullanıcılar alınırken hata: ${error.message}`);
      return res.status(500).json({ message: 'Kullanıcılar alınamadı' });
    }
  }

  async kullaniciEngelle(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.kullanici.update({
        where: { id },
        data: { aktif: false }
      });

      logController.addLog('info', `Kullanıcı engellendi: ${id}`);
      return res.json({ message: 'Kullanıcı başarıyla engellendi' });
    } catch (error: any) {
      logController.addLog('error', `Kullanıcı engellenirken hata: ${error.message}`);
      return res.status(500).json({ message: 'Kullanıcı engellenemedi' });
    }
  }

  async kullaniciSil(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.kullanici.delete({
        where: { id }
      });

      logController.addLog('info', `Kullanıcı silindi: ${id}`);
      return res.json({ message: 'Kullanıcı başarıyla silindi' });
    } catch (error: any) {
      logController.addLog('error', `Kullanıcı silinirken hata: ${error.message}`);
      return res.status(500).json({ message: 'Kullanıcı silinemedi' });
    }
  }
}

export const kullaniciController = new KullaniciController();