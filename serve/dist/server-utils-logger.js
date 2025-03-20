"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
/**
 * Utility di logging per il server
 */
const winston_1 = __importDefault(require("winston"));
const env_config_1 = require("../config/env-config");
// Definizione dei livelli di log personalizzati
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Definizione dei colori per i diversi livelli di log
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Aggiunge i colori a winston
winston_1.default.addColors(colors);
// Formato per i log in sviluppo (più dettagliati e colorati)
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}${info.data ? `\nData: ${JSON.stringify(info.data, null, 2)}` : ''}`));
// Formato per i log in produzione (JSON per analisi più facile)
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
// Determina il livello di log in base all'ambiente
const level = env_config_1.config.nodeEnv === 'development' ? 'debug' : 'info';
// Crea i trasporti per i log
const transports = [
    // Sempre log in console
    new winston_1.default.transports.Console(),
];
// Aggiunge il trasporto file solo in produzione
if (env_config_1.config.nodeEnv === 'production') {
    transports.push(
    // Log di errore in un file separato
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error'
    }), 
    // Tutti i log in un file
    new winston_1.default.transports.File({
        filename: 'logs/combined.log'
    }));
}
// Istanza di logger
exports.logger = winston_1.default.createLogger({
    level,
    levels,
    format: env_config_1.config.nodeEnv === 'development' ? developmentFormat : productionFormat,
    transports,
    // Non termina il processo per errori nei log
    exitOnError: false,
});
/**
 * Middleware per loggare le richieste HTTP in Express
 */
const httpLogger = (req, res, next) => {
    // Log solo se il livello è abbastanza alto
    if (exports.logger.levels[exports.logger.level] >= exports.logger.levels['http']) {
        const start = Date.now();
        res.on('finish', () => {
            var _a;
            const duration = Date.now() - start;
            exports.logger.http({
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.headers['user-agent'] || '-',
                ip: req.ip || req.headers['x-forwarded-for'] || '-',
                userId: ((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId) || 'anonymous',
            });
        });
    }
    next();
};
exports.httpLogger = httpLogger;
// Supporto per oggetti di errore
const originalErrorToJSON = Error.prototype.toJSON;
if (!originalErrorToJSON) {
    // @ts-ignore
    Error.prototype.toJSON = function () {
        return {
            message: this.message,
            name: this.name,
            stack: this.stack,
            ...this,
        };
    };
}
exports.default = {
    logger: exports.logger,
    httpLogger: exports.httpLogger,
};
