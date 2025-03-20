"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carica le variabili d'ambiente dal file .env nella cartella root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
/**
 * Configurazione delle variabili d'ambiente per l'applicazione
 */
exports.config = {
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
    validateEnv: () => {
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
if (!exports.config.validateEnv() && exports.config.nodeEnv === 'production') {
    console.error('Configurazione dell\'ambiente non valida. Chiusura dell\'applicazione.');
    process.exit(1);
}
exports.default = exports.config;
