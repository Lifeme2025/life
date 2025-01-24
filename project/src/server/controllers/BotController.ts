import { Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import { logController } from './LogController';
import { io } from '../index';
import { prisma } from '../services';
import { aiService } from '../services/aiService';
import { addToMessageQueue } from '../services/messageQueue';
import { eventBus, EVENT_TYPES } from '../utils/eventBus';

class BotController {
  private bots: Map<string, TelegramBot> = new Map();
  private botStats: Map<string, any> = new Map();
  private botStatus: Map<string, {
    status: 'online' | 'offline' | 'error';
    lastUpdate: Date;
    error?: string;
  }> = new Map();

  constructor() {
    // Her 30 saniyede bir bot durumlarını kontrol et
    setInterval(() => this.checkBotsStatus(), 30000);
  }

  private async checkBotsStatus() {
    try {
      const botlar = await prisma.bot.findMany({
        where: { aktif: true }
      });

      for (const bot of botlar) {
        const currentStatus = this.botStatus.get(bot.id);
        const isConnected = this.bots.has(bot.id);

        if (isConnected && (!currentStatus || currentStatus.status === 'offline')) {
          // Bot çevrimiçi oldu
          this.updateBotStatus(bot.id, 'online');
          eventBus.emit(EVENT_TYPES.BOT_STATUS_CHANGED, {
            botId: bot.id,
            botName: bot.isim,
            status: 'online',
            timestamp: new Date()
          });
        } else if (!isConnected && (!currentStatus || currentStatus.status === 'online')) {
          // Bot çevrimdışı oldu
          this.updateBotStatus(bot.id, 'offline');
          eventBus.emit(EVENT_TYPES.BOT_STATUS_CHANGED, {
            botId: bot.id,
            botName: bot.isim,
            status: 'offline',
            timestamp: new Date()
          });
        }
      }
    } catch (error: any) {
      logController.addLog('error', `Bot durumları kontrol edilirken hata: ${error.message}`);
    }
  }

  private updateBotStatus(botId: string, status: 'online' | 'offline' | 'error', error?: string) {
    this.botStatus.set(botId, {
      status,
      lastUpdate: new Date(),
      error
    });

    // WebSocket ile durumu yayınla
    io.emit('botStatusUpdate', {
      botId,
      status,
      lastUpdate: new Date(),
      error
    });
  }

  private setupBotHandlers(bot: TelegramBot, botId: string) {
    bot.on('message', async (msg) => {
      try {
        // Kullanıcıyı kontrol et/oluştur
        const kullanici = await this.getOrCreateUser(msg.from);

        // Mesajı kaydet
        await prisma.mesaj.create({
          data: {
            bot_id: botId,
            kullanici_id: kullanici.id,
            mesaj: msg.text || '',
            mesaj_tipi: this.getMesajTipi(msg)
          }
        });

        // İstatistikleri güncelle
        this.updateBotStats(botId, 'mesaj');

        // AI yanıtı al ve gönder
        if (msg.text && !msg.text.startsWith('/')) {
          const aiYanit = await aiService.getResponse(msg.text, msg.from.id.toString());
          await addToMessageQueue({
            botId,
            chatId: msg.chat.id,
            message: aiYanit,
            type: 'text'
          });
        }

        // Olayı yayınla
        eventBus.emit(EVENT_TYPES.MESSAGE_RECEIVED, {
          botId,
          message: msg,
          timestamp: new Date()
        });

      } catch (error: any) {
        logController.addLog('error', `Mesaj işlenirken hata: ${error.message}`);
        this.updateBotStatus(botId, 'error', error.message);
      }
    });

    bot.on('polling_error', (error) => {
      logController.addLog('error', `Bot polling hatası: ${error.message}`);
      this.updateBotStatus(botId, 'error', error.message);
      eventBus.emit(EVENT_TYPES.ERROR_OCCURRED, { botId, error: error.message });
    });

    // Bot başarıyla başlatıldı
    this.updateBotStatus(botId, 'online');
  }

  // ... Diğer metodlar aynı kalacak
}

export const botController = new BotController();