/**
 * Utility di logging per il server
 */
import winston from 'winston';
import { config } from '../config/env-config';

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
winston.addColors(colors);

// Formato per i log in sviluppo (più dettagliati e colorati)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? `\n${info.stack}` : ''
    }${
      info.data ? `\nData: ${JSON.stringify(info.data, null, 2)}` : ''
    }`
  )
);

// Formato per i log in produzione (JSON per analisi più facile)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Determina il livello di log in base all'ambiente
const level = config.nodeEnv === 'development' ? 'debug' : 'info';

// Crea i trasporti per i log
const transports = [
  // Sempre log in console
  new winston.transports.Console(),
];

// Aggiunge il trasporto file solo in produzione
if (config.nodeEnv === 'production') {
  transports.push(
    // Log di errore in un file separato
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Tutti i log in un file
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  );
}

// Istanza di logger
export const logger = winston.createLogger({
  level,
  levels,
  format: config.nodeEnv === 'development' ? developmentFormat : productionFormat,
  transports,
  // Non termina il processo per errori nei log
  exitOnError: false,
});

/**
 * Middleware per loggare le richieste HTTP in Express
 */
export const httpLogger = (req: any, res: any, next: any) => {
  // Log solo se il livello è abbastanza alto
  if (logger.levels[logger.level] >= logger.levels['http']) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'] || '-',
        ip: req.ip || req.headers['x-forwarded-for'] || '-',
        userId: req.session?.userId || 'anonymous',
      });
    });
  }
  
  next();
};

// Supporto per oggetti di errore
const originalErrorToJSON = Error.prototype.toJSON;
if (!originalErrorToJSON) {
  // @ts-ignore
  Error.prototype.toJSON = function () {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      ...(this as any),
    };
  };
}

export default {
  logger,
  httpLogger,
};
