import express from 'express';
import { analyticsController } from '../controllers/AnalyticsController';
import { tokenDogrula } from '../middleware/auth';

export const analyticsRouter = express.Router();

analyticsRouter.use(tokenDogrula);

analyticsRouter.get('/', (req, res) => {
  analyticsController.getAnalytics(req, res);
});