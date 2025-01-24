import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import { logController } from './LogController';
import { eventBus, EVENT_TYPES } from '../utils/eventBus';
import { prisma } from '../services';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PanelAction {
  type: 'ADD_FEATURE' | 'MODIFY_FEATURE' | 'REMOVE_FEATURE';
  component: string;
  description: string;
  code?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

class AIController {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.systemPrompt = `Sen Missme'sin, Telegram Bot Yönetim Paneli'nin AI asistanısın. Kullanıcılara panel üzerinde işlem yapmalarında yardımcı oluyorsun.

Panel Mimarisi:
- React + TypeScript + Vite
- TailwindCSS
- React Query
- React Router
- Lucide Icons
- Express.js Backend
- PostgreSQL (Supabase)

Mevcut Özellikler:
1. Bot Yönetimi
   - Bot ekleme, düzenleme, silme
   - Bot durumu kontrolü
   - Webhook yönetimi
   - Komut yönetimi

2. Kullanıcı Yönetimi
   - Kullanıcı listesi
   - Kullanıcı engelleme
   - Kullanıcı istatistikleri

3. Mesajlaşma
   - Mesaj şablonları
   - Toplu mesaj gönderimi
   - Zamanlanmış mesajlar
   - Medya kütüphanesi

4. İstatistikler ve Analiz
   - Bot performansı
   - Kullanıcı aktivitesi
   - Mesaj istatistikleri

5. Sistem Yönetimi
   - Güvenlik ayarları
   - Veritabanı yönetimi
   - Sistem logları
   - Bildirim yönetimi

Görevlerin:
1. Kullanıcının isteklerini analiz et
2. İsteğe uygun panel değişikliklerini planla
3. Yapılacak değişiklikleri listele
4. Gerekli kod değişikliklerini açıkla

Önemli:
- Mevcut mimariyi koru
- Modüler yapıyı bozma
- TypeScript tip güvenliğini sağla
- Responsive tasarımı koru
- En iyi pratikleri kullan`;
  }

  async handleChat(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const files = req.files as Express.Multer.File[];

      // Dosyaları işle
      let processedMessage = message;
      if (files?.length) {
        processedMessage += "\n\nEklenen dosyalar:\n";
        files.forEach(file => {
          processedMessage += `- ${file.originalname}\n`;
        });
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: processedMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;

      // Yanıtı analiz et ve gerekli aksiyonları belirle
      const actions = this.parseActions(response || '');

      // Olayı yayınla
      eventBus.emit(EVENT_TYPES.AI_ASSISTANT_RESPONSE, {
        message: processedMessage,
        response,
        actions,
        timestamp: new Date()
      });

      // Yanıtı kaydet
      await prisma.aiHistory.create({
        data: {
          prompt: message,
          response: response || '',
          actions: JSON.stringify(actions),
          status: 'completed',
          timestamp: new Date()
        }
      });

      res.json({
        response,
        actions
      });

    } catch (error: any) {
      logController.addLog('error', `AI yanıtı alınırken hata: ${error.message}`);
      res.status(500).json({ error: 'AI yanıtı alınamadı' });
    }
  }

  private parseActions(response: string): PanelAction[] {
    const actions: PanelAction[] = [];
    
    // Yanıtı analiz et ve gerekli aksiyonları çıkar
    const actionTypes = ['ADD_FEATURE', 'MODIFY_FEATURE', 'REMOVE_FEATURE'];
    const lines = response.split('\n');

    let currentAction: Partial<PanelAction> | null = null;

    for (const line of lines) {
      // Yeni bir aksiyon başlangıcı
      const actionMatch = line.match(/^(ADD|MODIFY|REMOVE)_FEATURE:/);
      if (actionMatch) {
        if (currentAction?.type && currentAction.component && currentAction.description) {
          actions.push(currentAction as PanelAction);
        }
        currentAction = {
          type: `${actionMatch[1]}_FEATURE` as PanelAction['type'],
          status: 'pending'
        };
        continue;
      }

      if (currentAction) {
        // Komponent adı
        if (line.startsWith('Component:')) {
          currentAction.component = line.replace('Component:', '').trim();
        }
        // Açıklama
        else if (line.startsWith('Description:')) {
          currentAction.description = line.replace('Description:', '').trim();
        }
        // Kod
        else if (line.startsWith('```')) {
          currentAction.code = line.replace('```', '').trim();
        }
      }
    }

    // Son aksiyonu ekle
    if (currentAction?.type && currentAction.component && currentAction.description) {
      actions.push(currentAction as PanelAction);
    }

    return actions;
  }
}

export const aiController = new AIController();