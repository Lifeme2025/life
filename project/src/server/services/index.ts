import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { logController } from '../controllers/LogController';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export const prisma = new PrismaClient();
export const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function initializeServices() {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$connect();
    logController.addLog('info', 'Veritabanı bağlantısı başarılı');

    // Supabase bağlantısını test et
    const { data, error } = await supabase.from('botlar').select('count');
    if (error) throw error;
    logController.addLog('info', 'Supabase bağlantısı başarılı');

    return true;
  } catch (error: any) {
    logController.addLog('error', `Servisler başlatılırken hata: ${error.message}`);
    throw error;
  }
}