import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { aiRouter } from './routes/aiRoutes';
import { authRouter } from './routes/authRoutes';
import { botRouter } from './routes/botRoutes';
import { logRouter } from './routes/logRoutes';
import { guvenlikRouter } from './routes/guvenlikRoutes';
import { kullaniciRouter } from './routes/kullaniciRoutes';
import { statsRouter } from './routes/statsRoutes';
import { webhookRouter } from './routes/webhookRoutes';
import { komutRouter } from './routes/komutRoutes';
import { promptRouter } from './routes/promptRoutes';
import { logController } from './controllers/LogController';
import { initializeServices } from './services';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:4173']
    : process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  connectTimeout: 60000,
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  path: '/socket.io'
});

// Socket.IO connection management
io.on('connection', (socket) => {
  logController.addLog('info', `WebSocket bağlantısı kuruldu: ${socket.id}`, 'socket');

  // Send initial metrics
  socket.emit('metrics', {
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    activeConnections: io.engine.clientsCount
  });

  socket.on('disconnect', (reason) => {
    logController.addLog('info', `WebSocket bağlantısı kapandı: ${socket.id} (${reason})`, 'socket');
  });

  socket.on('error', (error) => {
    logController.addLog('error', `WebSocket hatası: ${error.message}`, 'socket', {
      socketId: socket.id,
      error
    });
  });
});

// Error handlers
app.use((err: any, req: any, res: any, next: any) => {
  logController.addLog('error', `Server error: ${err.message}`, 'server', {
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

process.on('unhandledRejection', (reason: any) => {
  logController.addLog('error', `Unhandled Rejection: ${reason.message}`, 'process', {
    stack: reason.stack
  });
});

process.on('uncaughtException', (error: Error) => {
  logController.addLog('error', `Uncaught Exception: ${error.message}`, 'process', {
    stack: error.stack
  });
});

// Routes
app.use('/api/ai', aiRouter);
app.use('/api/auth', authRouter);
app.use('/api/bots', botRouter);
app.use('/api/logs', logRouter);
app.use('/api/guvenlik', guvenlikRouter);
app.use('/api/kullanicilar', kullaniciRouter);
app.use('/api/istatistikler', statsRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/komutlar', komutRouter);
app.use('/api/prompts', promptRouter);

// Start services
initializeServices().then(() => {
  const port = process.env.PORT || 3001;
  httpServer.listen(port, () => {
    logController.addLog('info', `Server başlatıldı: http://localhost:${port}`, 'server');
    console.log(`Server başlatıldı: http://localhost:${port}`);
  });
}).catch(error => {
  logController.addLog('error', `Servisler başlatılamadı: ${error.message}`, 'server', {
    stack: error.stack
  });
  process.exit(1);
});

export { io };