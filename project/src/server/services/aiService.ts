import { OpenAI } from 'openai';
import { logController } from '../controllers/LogController';
import { redis } from '../utils/redis';

class AIService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.systemPrompt = `Sen bir Telegram botusun. Kullanıcılara yardımcı olmak için varsın.
    Cevapların kısa ve öz olmalı.
    Kullanıcıya her zaman nazik ve yardımsever davranmalısın.
    Telegram formatını kullanabilirsin (bold, italic, etc.).`;
  }

  async getResponse(message: string, userId: string): Promise<string> {
    try {
      // Redis'ten geçmiş mesajları al
      const conversationKey = `conversation:${userId}`;
      const history = await redis.lrange(conversationKey, 0, -1);
      
      // Mesaj geçmişini formatla
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...history.map(msg => JSON.parse(msg)),
        { role: 'user', content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || 'Üzgünüm, şu anda yanıt veremiyorum.';

      // Yeni mesajları Redis'e kaydet
      await redis.rpush(conversationKey, JSON.stringify({ role: 'user', content: message }));
      await redis.rpush(conversationKey, JSON.stringify({ role: 'assistant', content: response }));

      // Geçmiş mesaj sayısını sınırla (son 10 mesaj)
      await redis.ltrim(conversationKey, -20, -1);

      return response;

    } catch (error: any) {
      logController.addLog('error', `AI yanıtı alınırken hata: ${error.message}`);
      throw new Error('AI yanıtı alınamadı');
    }
  }

  async updateSystemPrompt(newPrompt: string): Promise<void> {
    this.systemPrompt = newPrompt;
    logController.addLog('info', 'Sistem promptu güncellendi');
  }
}

export const aiService = new AIService();