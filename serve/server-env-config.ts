import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Configurazione delle variabili d'ambiente
export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'thermopolio-secret-key',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
};

// Verifica che le variabili necessarie siano definite
export const validateEnv = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'];
  let allVarsPresent = true;
  
  for (const varName of requiredVars) {
    if (!ENV[varName]) {
      logger.warn(`⚠️ La variabile d'ambiente ${varName} non è definita`);
      allVarsPresent = false;
    }
  }
  
  if (!ENV.SESSION_SECRET || ENV.SESSION_SECRET === 'thermopolio-secret-key') {
    logger.warn('⚠️ SESSION_SECRET non è definito o sta usando il valore di default');
    logger.warn('⚠️ Si consiglia di impostare un valore personalizzato per la sicurezza');
  }
  
  if (allVarsPresent) {
    logger.info('✅ Tutte le variabili d\'ambiente necessarie sono definite');
  } else {
    logger.warn('⚠️ Alcune variabili d\'ambiente necessarie non sono definite');
    logger.warn('⚠️ L\'applicazione potrebbe non funzionare correttamente');
  }
  
  return allVarsPresent;
};
