import express from 'express';
import { aiController } from '../controllers/AIController';
import { tokenDogrula } from '../middleware/auth';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const aiRouter = express.Router();

aiRouter.use(tokenDogrula);

aiRouter.post('/chat', upload.array('files'), (req, res) => {
  aiController.handleChat(req, res);
});

aiRouter.get('/history', async (req, res) => {
  try {
    const history = await prisma.aiHistory.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Geçmiş alınamadı' });
  }
});