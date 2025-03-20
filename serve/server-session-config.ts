/**
 * Configurazione delle sessioni per Express
 */
import { SessionOptions } from 'express-session';
import { config } from './env-config';

/**
 * Configurazione delle opzioni per la sessione
 */
export const sessionConfig: SessionOptions = {
  // Chiave segreta per la firma dei cookie di sessione
  secret: config.sessionSecret,
  
  // Non salvare nuovamente la sessione se non è stata modificata
  resave: false,
  
  // Non salvare sessioni non inizializzate
  saveUninitialized: false,
  
  // Configurazione del cookie
  cookie: {
    // Sicuro solo in produzione (HTTPS)
    secure: config.nodeEnv === 'production',
    
    // Impedisce l'accesso al cookie tramite JavaScript
    httpOnly: true,
    
    // Durata del cookie (24 ore in millisecondi)
    maxAge: 24 * 60 * 60 * 1000,
    
    // Percorso del cookie
    path: '/',
    
    // Il cookie è inviato solo al dominio che lo ha creato
    sameSite: 'lax',
  },
  
  // Nome del cookie di sessione
  name: 'thermopolio.sid',
};

/**
 * Configurazione delle opzioni per il refresh token
 */
export const refreshTokenConfig = {
  // Durata del refresh token (30 giorni in millisecondi)
  maxAge: 30 * 24 * 60 * 60 * 1000,
  
  // Chiave per memorizzare il refresh token
  key: 'thermopolio.refresh',
  
  // Impedisce l'accesso al cookie tramite JavaScript
  httpOnly: true,
  
  // Sicuro solo in produzione (HTTPS)
  secure: config.nodeEnv === 'production',
  
  // Percorso del cookie
  path: '/',
  
  // Il cookie è inviato solo al dominio che lo ha creato
  sameSite: 'lax',
};

export default {
  session: sessionConfig,
  refreshToken: refreshTokenConfig,
};
