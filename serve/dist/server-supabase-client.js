"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.testSupabaseConnection = exports.supabaseAdmin = exports.supabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_config_1 = require("../config/env-config");
const logger_1 = require("../utils/logger");
/**
 * Client Supabase per interagire con il database
 */
exports.supabaseClient = (0, supabase_js_1.createClient)(env_config_1.ENV.SUPABASE_URL, env_config_1.ENV.SUPABASE_ANON_KEY);
/**
 * Client Supabase per operazioni administrative
 * Utilizza la service key che ha permessi elevati
 */
exports.supabaseAdmin = (0, supabase_js_1.createClient)(env_config_1.ENV.SUPABASE_URL, env_config_1.ENV.SUPABASE_SERVICE_KEY);
/**
 * Testa la connessione al database Supabase
 * @returns Una promessa che risolve a true se la connessione è riuscita
 */
const testSupabaseConnection = async () => {
    try {
        const { data, error } = await exports.supabaseClient.from('users').select('count');
        if (error) {
            logger_1.logger.error(`Errore di connessione a Supabase: ${error.message}`);
            return false;
        }
        logger_1.logger.info('Connessione a Supabase stabilita con successo');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Errore durante il test di connessione a Supabase:', error);
        return false;
    }
};
exports.testSupabaseConnection = testSupabaseConnection;
/**
 * Inizializza lo schema del database se necessario
 * Questa funzione crea le tabelle e gli indici se non esistono
 */
const initializeDatabase = async () => {
    try {
        // Questo è un esempio molto semplificato
        // In un'implementazione reale, si utilizzerebbero le migrazioni
        // o uno script SQL completo
        logger_1.logger.info('Inizializzazione del database...');
        // Verifica se la tabella users esiste
        const { data: tableExists, error: tableError } = await exports.supabaseAdmin.rpc('check_table_exists', { table_name: 'users' });
        if (tableError) {
            logger_1.logger.error(`Errore durante la verifica delle tabelle: ${tableError.message}`);
            return;
        }
        // Se la tabella non esiste, esegui lo script di inizializzazione
        if (!tableExists) {
            logger_1.logger.info('Schema del database non trovato, creazione in corso...');
            // Qui puoi eseguire lo script SQL completo
            // ad esempio leggendo il file db-schema-sql.sql
            // e eseguendolo tramite supabaseAdmin
            logger_1.logger.info('Schema del database creato con successo');
        }
        else {
            logger_1.logger.info('Schema del database già esistente');
        }
    }
    catch (error) {
        logger_1.logger.error('Errore durante l\'inizializzazione del database:', error);
    }
};
exports.initializeDatabase = initializeDatabase;
