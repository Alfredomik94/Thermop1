"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
// Carica le variabili d'ambiente dal file .env
dotenv_1.default.config();
// Configurazione delle variabili d'ambiente
exports.ENV = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SESSION_SECRET: process.env.SESSION_SECRET || 'thermopolio-secret-key',
    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
};
// Verifica che le variabili necessarie siano definite
const validateEnv = () => {
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'];
    let allVarsPresent = true;
    for (const varName of requiredVars) {
        if (!exports.ENV[varName]) {
            logger_1.logger.warn(`⚠️ La variabile d'ambiente ${varName} non è definita`);
            allVarsPresent = false;
        }
    }
    if (!exports.ENV.SESSION_SECRET || exports.ENV.SESSION_SECRET === 'thermopolio-secret-key') {
        logger_1.logger.warn('⚠️ SESSION_SECRET non è definito o sta usando il valore di default');
        logger_1.logger.warn('⚠️ Si consiglia di impostare un valore personalizzato per la sicurezza');
    }
    if (allVarsPresent) {
        logger_1.logger.info('✅ Tutte le variabili d\'ambiente necessarie sono definite');
    }
    else {
        logger_1.logger.warn('⚠️ Alcune variabili d\'ambiente necessarie non sono definite');
        logger_1.logger.warn('⚠️ L\'applicazione potrebbe non funzionare correttamente');
    }
    return allVarsPresent;
};
exports.validateEnv = validateEnv;
