import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Hata:', err);

  // Özel hata tipleri için kontroller eklenebilir
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Geçersiz veri formatı',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Yetkisiz erişim',
      details: err.message
    });
  }

  // Genel hata durumu
  res.status(500).json({
    message: 'Sunucu hatası',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
};