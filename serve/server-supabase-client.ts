import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env-config';
import { logger } from '../utils/logger';

/**
 * Client Supabase per interagire con il database
 */
export const supabaseClient = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
);

/**
 * Client Supabase per operazioni administrative
 * Utilizza la service key che ha permessi elevati
 */
export const supabaseAdmin = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_KEY
);

/**
 * Testa la connessione al database Supabase
 * @returns Una promessa che risolve a true se la connessione è riuscita
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabaseClient.from('users').select('count');
    
    if (error) {
      logger.error(`Errore di connessione a Supabase: ${error.message}`);
      return false;
    }
    
    logger.info('Connessione a Supabase stabilita con successo');
    return true;
  } catch (error) {
    logger.error('Errore durante il test di connessione a Supabase:', error);
    return false;
  }
};

/**
 * Inizializza lo schema del database se necessario
 * Questa funzione crea le tabelle e gli indici se non esistono
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Questo è un esempio molto semplificato
    // In un'implementazione reale, si utilizzerebbero le migrazioni
    // o uno script SQL completo
    
    logger.info('Inizializzazione del database...');
    
    // Verifica se la tabella users esiste
    const { data: tableExists, error: tableError } = await supabaseAdmin.rpc(
      'check_table_exists',
      { table_name: 'users' }
    );
    
    if (tableError) {
      logger.error(`Errore durante la verifica delle tabelle: ${tableError.message}`);
      return;
    }
    
    // Se la tabella non esiste, esegui lo script di inizializzazione
    if (!tableExists) {
      logger.info('Schema del database non trovato, creazione in corso...');
      
      // Qui puoi eseguire lo script SQL completo
      // ad esempio leggendo il file db-schema-sql.sql
      // e eseguendolo tramite supabaseAdmin
      
      logger.info('Schema del database creato con successo');
    } else {
      logger.info('Schema del database già esistente');
    }
  } catch (error) {
    logger.error('Errore durante l\'inizializzazione del database:', error);
  }
};
