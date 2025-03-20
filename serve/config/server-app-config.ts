/**
 * Configurazione generale dell'applicazione server
 */
import { config } from './env-config';

/**
 * Configurazione delle opzioni dell'applicazione
 */
export const appConfig = {
  /**
   * Nome dell'applicazione
   */
  name: 'Thermopolio API',
  
  /**
   * Versione dell'applicazione
   */
  version: '1.0.0',
  
  /**
   * Porta su cui il server è in ascolto
   */
  port: config.port,
  
  /**
   * Ambiente di esecuzione
   */
  nodeEnv: config.nodeEnv,
  
  /**
   * Configurazione CORS
   */
  cors: {
    origin: config.corsOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  },
  
  /**
   * Configurazione dei rate limiter
   */
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100, // limite di 100 richieste per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Troppe richieste, riprova più tardi',
  },
  
  /**
   * Impostazioni del logger
   */
  logger: {
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    format: config.nodeEnv === 'development' ? 'dev' : 'combined',
    filePath: 'logs/server.log',
  },
  
  /**
   * Configurazione delle email
   */
  email: {
    enabled: config.emailEnabled,
    from: config.emailFrom,
    templates: {
      welcome: 'welcome',
      resetPassword: 'reset-password',
      verifyEmail: 'verify-email',
      orderConfirmation: 'order-confirmation',
      donationReceived: 'donation-received',
    },
  },
  
  /**
   * Impostazioni di sicurezza
   */
  security: {
    bcryptSaltRounds: 10,
    jwtSecret: config.sessionSecret,
    jwtExpiresIn: '7d',
    jwtRefreshExpiresIn: '30d',
  },
  
  /**
   * URL pubblici dell'applicazione
   */
  urls: {
    clientBaseUrl: 'http://localhost:5173',
    apiBaseUrl: 'http://localhost:3000/api',
    verifyEmailUrl: '/verify-email',
    resetPasswordUrl: '/reset-password',
  },
  
  /**
   * Configurazione dei file caricati
   */
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
    imageResizeOptions: {
      width: 800,
      height: 800,
      fit: 'inside',
    },
  },
  
  /**
   * Configurazione performance
   */
  performance: {
    compression: true,
    caching: config.nodeEnv === 'production',
    cacheTTL: 60 * 60, // 1 ora in secondi
  },
};

export default appConfig;
