import express from 'express';
import { guvenlikController } from '../controllers/GuvenlikController';
import { tokenDogrula } from '../middleware/auth';

export const guvenlikRouter = express.Router();

guvenlikRouter.use(tokenDogrula);

guvenlikRouter.get('/', (req, res) => {
  guvenlikController.getGuvenlikDurumu(req, res);
});

guvenlikRouter.post('/ip-engelle', (req, res) => {
  guvenlikController.ipEngelle(req, res);
});

guvenlikRouter.delete('/ip-engelle/:ip', (req, res) => {
  guvenlikController.ipEngeliKaldir(req, res);
});