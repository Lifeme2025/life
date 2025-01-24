import express from 'express';
import { logController } from '../controllers/LogController';
import { tokenDogrula } from '../middleware/auth';

export const logRouter = express.Router();

logRouter.use(tokenDogrula);

logRouter.get('/', (req, res) => {
  logController.getLogs(req, res);
});

logRouter.delete('/', (req, res) => {
  logController.clearLogs(req, res);
});