import Queue from 'bull';
import { logController } from '../controllers/LogController';
import { eventBus, EVENT_TYPES } from '../utils/eventBus';

interface MessageJob {
  botId: number;
  chatId: number;
  message: string;
  type: 'text' | 'photo' | 'video' | 'document';
  mediaUrl?: string;
}

const messageQueue = new Queue<MessageJob>('message-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

messageQueue.on('completed', (job) => {
  logController.addLog('info', `Mesaj gönderildi: ${job.id}`);
  eventBus.emit(EVENT_TYPES.MESSAGE_SENT, job.data);
});

messageQueue.on('failed', (job, err) => {
  logController.addLog('error', `Mesaj gönderilemedi: ${err.message}`);
  eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, { jobId: job?.id, error: err.message });
});

export const addToMessageQueue = async (messageData: MessageJob) => {
  try {
    const job = await messageQueue.add(messageData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    logController.addLog('info', `Mesaj kuyruğa eklendi: ${job.id}`);
    return job.id;
  } catch (error: any) {
    logController.addLog('error', `Mesaj kuyruğa eklenemedi: ${error.message}`);
    throw error;
  }
};

export { messageQueue };