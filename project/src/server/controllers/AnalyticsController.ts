import { Request, Response } from 'express';
import { prisma } from '../services';
import { logController } from './LogController';
import { eventBus, EVENT_TYPES } from '../utils/eventBus';

interface AnalyticsEvent {
  bot_id: string;
  user_id: string;
  event_type: 'message' | 'command' | 'button_click' | 'join' | 'leave';
  metadata: Record<string, any>;
  timestamp: Date;
}

class AnalyticsController {
  private activeUsers: Map<string, Set<string>> = new Map(); // bot_id -> Set<user_id>
  private realtimeMetrics: Map<string, any> = new Map(); // bot_id -> metrics

  constructor() {
    // Her 5 saniyede bir real-time metrikleri güncelle
    setInterval(() => this.broadcastMetrics(), 5000);
  }

  async trackEvent(event: AnalyticsEvent) {
    try {
      // Olayı veritabanına kaydet
      await prisma.analizOlayi.create({
        data: {
          bot_id: event.bot_id,
          kullanici_id: event.user_id,
          olay_tipi: event.event_type,
          metadata: event.metadata,
          tarih: event.timestamp
        }
      });

      // Real-time metrikleri güncelle
      this.updateRealtimeMetrics(event);

      // Olayı yayınla
      eventBus.emit(EVENT_TYPES.ANALYTICS_EVENT, event);
    } catch (error: any) {
      logController.addLog('error', `Analiz olayı kaydedilirken hata: ${error.message}`);
    }
  }

  private updateRealtimeMetrics(event: AnalyticsEvent) {
    const metrics = this.realtimeMetrics.get(event.bot_id) || {
      activeUsers: 0,
      messageCount: 0,
      commandCount: 0,
      interactionRate: 0,
      userSessions: new Map()
    };

    // Aktif kullanıcıları güncelle
    if (!this.activeUsers.has(event.bot_id)) {
      this.activeUsers.set(event.bot_id, new Set());
    }
    this.activeUsers.get(event.bot_id)?.add(event.user_id);

    // Metrikleri güncelle
    metrics.activeUsers = this.activeUsers.get(event.bot_id)?.size || 0;
    
    if (event.event_type === 'message') metrics.messageCount++;
    if (event.event_type === 'command') metrics.commandCount++;

    // Kullanıcı oturumunu güncelle
    const userSession = metrics.userSessions.get(event.user_id) || {
      startTime: event.timestamp,
      lastActivity: event.timestamp,
      eventCount: 0,
      platform: event.metadata.platform,
      location: event.metadata.location
    };
    userSession.lastActivity = event.timestamp;
    userSession.eventCount++;
    metrics.userSessions.set(event.user_id, userSession);

    // Etkileşim oranını hesapla
    const totalEvents = metrics.messageCount + metrics.commandCount;
    metrics.interactionRate = totalEvents / metrics.activeUsers || 0;

    this.realtimeMetrics.set(event.bot_id, metrics);
  }

  private broadcastMetrics() {
    const allMetrics = Array.from(this.realtimeMetrics.entries()).map(([botId, metrics]) => ({
      bot_id: botId,
      ...metrics,
      userSessions: Array.from(metrics.userSessions.entries()).map(([userId, session]) => ({
        user_id: userId,
        ...session
      }))
    }));

    eventBus.emit(EVENT_TYPES.ANALYTICS_UPDATE, allMetrics);
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const { bot_id, start_date, end_date } = req.query;

      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();

      // Temel metrikler
      const baseMetrics = await prisma.analizOlayi.groupBy({
        by: ['bot_id', 'olay_tipi'],
        where: {
          bot_id: bot_id as string,
          tarih: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true
      });

      // Kullanıcı metrikleri
      const userMetrics = await prisma.analizOlayi.groupBy({
        by: ['kullanici_id'],
        where: {
          bot_id: bot_id as string,
          tarih: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true,
        _min: {
          tarih: true
        },
        _max: {
          tarih: true
        }
      });

      // Saatlik dağılım
      const hourlyDistribution = await prisma.$queryRaw`
        SELECT 
          date_trunc('hour', tarih) as hour,
          count(*) as count
        FROM analiz_olaylari
        WHERE bot_id = ${bot_id}
          AND tarih >= ${startDate}
          AND tarih <= ${endDate}
        GROUP BY hour
        ORDER BY hour
      `;

      // Platform ve lokasyon dağılımı
      const platformDistribution = await prisma.analizOlayi.groupBy({
        by: ['metadata'],
        where: {
          bot_id: bot_id as string,
          tarih: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: true
      });

      // Real-time metrikler
      const realtimeMetrics = this.realtimeMetrics.get(bot_id as string) || {};

      return res.json({
        baseMetrics,
        userMetrics,
        hourlyDistribution,
        platformDistribution,
        realtimeMetrics
      });
    } catch (error: any) {
      logController.addLog('error', `Analiz verileri alınırken hata: ${error.message}`);
      return res.status(500).json({ message: 'Analiz verileri alınamadı' });
    }
  }
}

export const analyticsController = new AnalyticsController();