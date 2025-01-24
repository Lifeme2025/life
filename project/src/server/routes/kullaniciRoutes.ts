import express from 'express';
import { kullaniciController } from '../controllers/KullaniciController';
import { tokenDogrula } from '../middleware/auth';

export const kullaniciRouter = express.Router();

kullaniciRouter.use(tokenDogrula);

kullaniciRouter.get('/', (req, res) => {
  kullaniciController.getKullanicilar(req, res);
});

kullaniciRouter.put('/:id/engelle', (req, res) => {
  kullaniciController.kullaniciEngelle(req, res);
});

kullaniciRouter.delete('/:id', (req, res) => {
  kullaniciController.kullaniciSil(req, res);
});