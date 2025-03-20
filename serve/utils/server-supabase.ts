import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env-config';

// Verifica che le variabili d'ambiente siano definite
if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.error('Variabili d\'ambiente Supabase mancanti. Controlla il file .env');
  process.exit(1);
}

// Crea e esporta il client Supabase
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey
);

/**
 * Ottiene l'URL per l'archiviazione di Supabase
 * @param bucket Nome del bucket
 * @param path Percorso del file all'interno del bucket
 * @returns URL del file
 */
export const getStorageUrl = (bucket: string, path: string): string => {
  return `${config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

/**
 * Verifica se una tabella esiste nel database
 * @param tableName Nome della tabella
 * @returns true se la tabella esiste, false altrimenti
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error(`Errore durante la verifica della tabella ${tableName}:`, error);
    return false;
  }
};

/**
 * Inizializza la struttura del database se non esiste già
 */
export const initializeDatabase = async (): Promise<void> => {
  console.log('Verificando la struttura del database...');
  
  const requiredTables = [
    'users',
    'subscription_plans',
    'subscription_discounts',
    'orders',
    'ratings',
    'notifications',
    'pickup_points'
  ];
  
  const missingTables = [];
  
  for (const table of requiredTables) {
    const exists = await tableExists(table);
    if (!exists) {
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    console.warn(`Tabelle mancanti: ${missingTables.join(', ')}`);
    console.warn('Esegui lo script SQL per creare lo schema del database.');
  } else {
    console.log('Struttura del database verificata con successo.');
  }
};

export default supabase;
