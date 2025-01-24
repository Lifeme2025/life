import express from 'express';
import { tokenDogrula } from '../middleware/auth';
import { botController } from '../controllers/BotController';
import { logController } from '../controllers/LogController';

export const botRouter = express.Router();

botRouter.use(tokenDogrula);

botRouter.get('/', (req, res) => {
  botController.tumBotlariGetir(req, res);
});

botRouter.post('/', (req, res) => {
  botController.botEkle(req, res);
});

botRouter.delete('/:id', (req, res) => {
  botController.botSil(req, res);
});

botRouter.put('/:id/durum', (req, res) => {
  botController.botDurumDegistir(req, res);
});