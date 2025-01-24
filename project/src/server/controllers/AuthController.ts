import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'gizli-anahtar';

export class AuthController {
  async login(req: Request, res: Response) {
    const { kullanici_adi, sifre } = req.body;

    if (!kullanici_adi || !sifre) {
      return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli' });
    }

    // Basit test kullanıcı kontrolü
    if (kullanici_adi === 'test' && sifre === 'test') {
      const token = jwt.sign(
        { id: 1, kullanici_adi: 'test' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({ token });
    }

    return res.status(401).json({ message: 'Hatalı kullanıcı adı veya şifre' });
  }
}