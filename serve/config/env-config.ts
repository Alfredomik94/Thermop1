import dotenv from 'dotenv';
import path from 'path';

// Carica le variabili d'ambiente dal file .env nella cartella root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Configurazione delle variabili d'ambiente per l'applicazione
 */
export const config = {
  // Server
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  
  // Sessione
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  
  // Sistema di email (simulato)
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  emailFrom: process.env.EMAIL_FROM || 'noreply@thermopolio.it',
  
  // Storage
  storageUrl: process.env.STORAGE_URL || '',
  
  // Validazione dell'ambiente
  validateEnv: (): boolean => {
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_KEY',
      'SESSION_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Variabili d\'ambiente mancanti:', missingVars.join(', '));
      console.error('Controlla il file .env');
      return false;
    }
    
    return true;
  }
};

// Verifica l'ambiente all'importazione
if (!config.validateEnv() && config.nodeEnv === 'production') {
  console.error('Configurazione dell\'ambiente non valida. Chiusura dell\'applicazione.');
  process.exit(1);
}

export default config;
