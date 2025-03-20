"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.tableExists = exports.getStorageUrl = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_config_1 = require("../config/env-config");
// Verifica che le variabili d'ambiente siano definite
if (!env_config_1.config.supabaseUrl || !env_config_1.config.supabaseServiceKey) {
    console.error('Variabili d\'ambiente Supabase mancanti. Controlla il file .env');
    process.exit(1);
}
// Crea e esporta il client Supabase
exports.supabase = (0, supabase_js_1.createClient)(env_config_1.config.supabaseUrl, env_config_1.config.supabaseServiceKey);
/**
 * Ottiene l'URL per l'archiviazione di Supabase
 * @param bucket Nome del bucket
 * @param path Percorso del file all'interno del bucket
 * @returns URL del file
 */
const getStorageUrl = (bucket, path) => {
    return `${env_config_1.config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};
exports.getStorageUrl = getStorageUrl;
/**
 * Verifica se una tabella esiste nel database
 * @param tableName Nome della tabella
 * @returns true se la tabella esiste, false altrimenti
 */
const tableExists = async (tableName) => {
    try {
        const { data, error } = await exports.supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', tableName)
            .eq('table_schema', 'public');
        if (error)
            throw error;
        return data && data.length > 0;
    }
    catch (error) {
        console.error(`Errore durante la verifica della tabella ${tableName}:`, error);
        return false;
    }
};
exports.tableExists = tableExists;
/**
 * Inizializza la struttura del database se non esiste già
 */
const initializeDatabase = async () => {
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
        const exists = await (0, exports.tableExists)(table);
        if (!exists) {
            missingTables.push(table);
        }
    }
    if (missingTables.length > 0) {
        console.warn(`Tabelle mancanti: ${missingTables.join(', ')}`);
        console.warn('Esegui lo script SQL per creare lo schema del database.');
    }
    else {
        console.log('Struttura del database verificata con successo.');
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = exports.supabase;
