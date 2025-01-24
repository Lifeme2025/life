import express from 'express';
import { statsController } from '../controllers/StatsController';
import { tokenDogrula } from '../middleware/auth';

export const statsRouter = express.Router();

statsRouter.use(tokenDogrula);

statsRouter.get('/', (req, res) => {
  statsController.getStats(req, res);
});